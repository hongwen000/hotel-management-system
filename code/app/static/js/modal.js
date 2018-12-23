let vue_modal = {
    props: ['header', 'msg', 'show'],
    compolents: ['result-table'],
    template: `
        <div class="modal" :class="{'is-active': show}">
        <div class="modal-background" @click="$emit('bg_click')">
        </div>
        <div class="modal-content">
            <article class="message">
                <div class="message-header">
                    <p> {{ header }} </p>
                    <button class="delete" aria-label="delete"></button>
                </div>
                <div class="message-body">
                    <p v-for="msgitem in msg"> {{ msgitem }} </p>
                </div>
            </article>
        </div>
        <button class="modal-close is-large" aria-label="close"></button>
        </div>
    `
};

Vue.component('vue-modal', vue_modal);




