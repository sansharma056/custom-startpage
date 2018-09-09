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

listBtn.addEventListener('click', (e) => {
    listClick(e);
});

listBody.forEach( e => {
    e.addEventListener('click', (e) => {
        itemTransfer(e);
    });
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
            <tr class="list__item" data-id="${i}" data-target="${target}">
                <td>${item}</td>
                <td>
                    <input class="checkbox" type="checkbox">
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
    if(e.target.classList.contains('checkbox')){
        const id = e.target.parentNode.parentNode;

        if(id.dataset.target === 'pending') {
            state.finished.push(state.pending[id.dataset.id]);
            state.pending.splice(id.dataset.id, 1);
        }
        else {
            state.finished.splice(id.dataset.id, 1);
        }
        
        stateUpdate();
        listRender();
    }
}