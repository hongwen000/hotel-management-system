let result_table = {
    props: ['result', 'deletable', 'button_msg', 'always_button'],
    template: `
        <section v-if="result.length > 0">
            <div class="container">
                <content class="has-text-centered">
                    <h1 class="title"> result </h1>
                </content>
                <table class="table">
                    <thead>
                        <tr>
                            <th v-for="(_, key) in result[0]"> {{ key }} </th>
                            <th v-if="deletable"> action </th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="res in result" @click="$emit('click_row', res.id)">
                            <td v-for="val in res"> {{ val }} </td>
                            <td> <button 
                                class="button is-small"
                                :class="{'is-danger': res.status === 1, 'is-light': res.status !== 1}"
                                v-if="deletable && (always_button || res.status === 1)"
                                @click.stop.prevent="$emit('cancel', res.id)"> {{button_msg}} 
                                </button>  
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </section>
    `
};

Vue.component('result-table', result_table);