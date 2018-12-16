let result_table = {
    props: ['result'],
    template: `
        <section v-if="result.length > 0">
            <div class="container">
                <table class="table">
                    <thead>
                        <tr v-for="key in result[0]">
                            <th> {{key}} </th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="res in result">
                            <td v-for="key in res"> {{ res[key] }} </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </section>
    `
};

Vue.component('result-table', result_table);