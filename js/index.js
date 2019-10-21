const searchBtn = document.querySelector('.button--search');
const searchInput = document.querySelector('.button--text');
const greeting = document.querySelector('.greeting');

const listBody = document.querySelectorAll('.list__body');
const listBtn = document.querySelector('.list__btn');
const listInput = document.querySelector('.list__input');

const tabs = document.querySelector('.tabs');
const tab1 = document.querySelector('.tab--1');
const tab2 = document.querySelector('.tab--2');
const tabCont1 = document.querySelector('.tabs__content--1');
const tabCont2 = document.querySelector('.tabs__content--2');

let state = {
    activeTab: 1,
    pending: [],
    finished: []    
};

window.addEventListener('load', ()=> {
    // Restores state from localStorage.
    stateRestore();

    // Makes the tab which is selected visible.
    if (state.activeTab === 1) {
        tabCont1.style.display = 'block';
    }
    else {
        tabCont2.style.display = 'block';
    }

    // Greets user, add .is-active to selected tab, render items in the list.
    greetUser();
    tabActiveToggle();
    listRender();
});

searchInput.addEventListener('keypress', (e) => {
    if(e.keyCode === 13) {
        searchClick(e);
    }
});

searchBtn.addEventListener('click', (e) => {
    searchClick(e);
});

tabs.addEventListener('click', (e) => {
    e.preventDefault();
    if(e.target.parentNode.classList.contains('tab--2')) {
        state.activeTab = 2;
        tabActiveToggle();

        tabCont1.style.display = 'none';
        tabCont2.style.display = 'block';
    }
    else if(e.target.parentNode.classList.contains('tab--1')) {
        state.activeTab = 1;
        tabActiveToggle();
        
        tabCont1.style.display = 'block';
        tabCont2.style.display = 'none';
    }

    stateUpdate();
    listRender();
});

listInput.addEventListener('keydown', (e) => {
    if(e.keyCode === 13) {
        listClick(e);
    }
});

listBody.forEach( e => {
    let source, destination;

    e.addEventListener('click', (e) => {
        window.e = e;
        if(e.target.nodeName!='TD') {
            let el = e.target.closest("span");
            switch(el.id) {
                case 'delete':  itemTransfer(e);
                                break;
                case 'edit':    itemEdit(e);
                                break;
                case 'check':   itemCheck(e);
                                break;
                }
        }
    });

    e.addEventListener('dragstart', (e) => {
        if(e.target.classList[0] === 'list__item') {
            source = e.target;
            e.dataTransfer.setData('text/plain', null);
            e.dataTransfer.effectAllowed = 'move';
        }        
    });

    e.addEventListener('keypress', (e) => {
        if(e.keyCode === 13) {
            document.querySelector('#check').click();
        }
    });
  
    e.addEventListener('dragenter', (e) => {
        if(e.target.nodeName === 'TD') {
            destination = e.target.parentNode;
        }
         if(destination!='undefined' && destination.classList[0] === 'list__item') {       
            if(isBefore(source, destination)) {
                source.parentNode.insertBefore(source, destination);
            } else {
                source.parentNode.insertBefore(source, destination.nextSibling);
            }
            listUpdate();
            stateUpdate();
        }            
    });

   function isBefore(a,b) {
        if(a.parentNode == b.parentNode) {
            for(let cur=a; cur; cur=cur.previousSibling) {
                if(cur === b) {
                    return true;
                }
            }   
        }
        return false;
    }
}); 

listBtn.addEventListener('click', (e) => {
    listClick(e);
});

function searchClick(e) {
    e.preventDefault();
    const q = searchInput.value;
    if(q) {
        window.open(`https://www.google.com/search?q=${q}`);
        searchInput.value = '';
    }
}

function listClick(e) {
    e.preventDefault();

    const item = document.querySelector('.list__input').value;

    if(item) {
        state.pending.push(item);
        stateUpdate();
        listRender();
        listInput.value = '';
    }
}

function listUpdate() {
    const listItems = document.querySelectorAll('.list__item');
    listItems.forEach( (e,i) => {
        if(state.activeTab == 1) {
            state.pending[i] = e.children[0].innerText;
            e.dataset.id = i;
        } else {
            state.finished[i] = e.children[0].innerText;
            e.dataset.id = i;
        }
    });

}

function listRender() {
    listReset();
    
    let target;

    if(state.activeTab === 1) {
        target = 'pending';
    }
    else{
        target = 'finished';
    }

    if(state[target].length === 0) {
        const html = 
        `
            <tr>
                <td>Nothing here, move on.</td>
            </tr>
        `;
        listBody[state.activeTab-1].insertAdjacentHTML('beforeend', html);
    }

    state[target].forEach( (item, i) => {
        const html = 
        `
            <tr class="list__item" draggable="true" data-id="${i}" data-status="${target}">
                <td>
                    ${item}
                </td>
                <td>
                    <span id="delete" class="icon"><i class="fas fa-trash-alt"></i></span>
                    <span id="edit" class="icon"><i class="fas fa-edit"></i></span>
                </td>
            </tr>
        `;
        listBody[state.activeTab-1].insertAdjacentHTML('beforeend', html);
    });
}

function listReset() {
    // Clean any previous item in the list
    listBody.forEach( i => i.textContent = '');
}

function tabActiveToggle() {
    // Toggles .is-active depending upon the selected tab.
    if(state.activeTab === 1) {
        tab1.classList.add('is-active');
        tab2.classList.remove('is-active');
    }
    else {
        tab2.classList.add('is-active');
        tab1.classList.remove('is-active');
    }
}

function greetUser() {
    const hour = new Date().getHours();
    let time;

    if(hour >= 21) {
        time = 'Night';
    }
    else if(hour >= 16) {
        time = 'Evening';
    }
    else if(hour >= 12) {
        time = 'Afternoon';
    }
    else {
        time = 'Morning';
    }
    greeting.textContent = `Good ${time}, human.`;
}

function stateUpdate() {
    // Transfers data to localStorage.
    localStorage.setItem("state", JSON.stringify(state));
}

function stateRestore() {
    // If a state exists in localStorage, copies it.
    if(localStorage.getItem("state"))
    {
        state = JSON.parse(localStorage.getItem("state"));
    }
}

function itemTransfer(e) {
    const id = e.target.closest("tr");

        if(id.dataset.status === 'pending') {
            state.finished.push(state.pending[id.dataset.id]);
            state.pending.splice(id.dataset.id, 1);
        }
        else {
            state.finished.splice(id.dataset.id, 1);
        }
        
        stateUpdate();
        listRender();
}

function itemEdit(e) {
    const item = e.target.closest('tr').children[0];
    const icon = e.target.closest('span');

    item.contentEditable = true;
    item.style.cursor = 'text';
    item.focus();
    
    icon.id = 'check';
    icon.innerText = '';
    icon.innerHTML = '<i class="fas fa-check-circle"></i>';
}
function itemCheck(e) {
    e.preventDefault();
    const item = e.target.closest('tr').children[0];
    const icon = e.target.closest('span');

    item.contentEditable = false;
    item.style.cursor = '';

    if(state.activeTab === 1) {
        state.pending[item.parentNode.dataset.id] = item.innerText;
    } else {
        state.finished[item.parentNode.dataset.id], item.innerText;
    }

    stateUpdate();

    icon.id = 'edit';
    icon.innerText = '';
    icon.innerHTML = '<i class="fas fa-edit"></i>';    
}