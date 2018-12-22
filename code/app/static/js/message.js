let message = {
    props: ['iserror', 'msg'],
    template: `
    <div class="container">
    <article class="message is-danger" v-if="iserror && msg != ''">
        <div class="message-header">
            <p>ERROR</p>
        </div>
        <div class="message-body">
            {{ msg }}
        </div>
    </article>

    <article class="message" v-if="!iserror && msg != ''">
        <div class="message-header">
            <p>INFO</p>
        </div>
        <div class="message-body">
            {{ msg }}
        </div>
    </article>
    </div>
    `
};


Vue.component('general-message', message);