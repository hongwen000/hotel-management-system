let result_table = {
    props: ['result', 'deletable', 'button_msg'],
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
                        <tr v-for="res in result">
                            <td v-for="val in res"> {{ val }} </td>
                            <td> <button 
                                class="button is-small is-danger" 
                                v-if="deletable && res.status === 1"
                                @click="$emit('cancel', res.id)"> {{button_msg}} 
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