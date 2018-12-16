let result_table = {
    props: ['result'],
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
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="res in result">
                            <td v-for="val in res"> {{ val }} </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </section>
    `
};

Vue.component('result-table', result_table);