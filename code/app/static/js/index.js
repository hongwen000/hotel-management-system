$('.content').hide();
$('#user').show();

$('#tab ul li').on('click', function() {
    $('#tab ul li').removeClass('is-active');
    $(this).addClass('is-active');
    $('.content').hide();
    $('#' + $(this).attr('name')).show();
})

let res_table = new Vue({
    el: '#res-table',
    data: {
        users: []
    }
});

let user_app = new Vue({
    el: '#user',
    data: {
        name: '',
        phone: '',
        credential: '',
        balance: '',
        bonus: '',
        genders: []
    },
    methods: {
        submit: function() {
            console.log(this.$data);
            data = {
                'name': this.name,
                'credential': this.credential,
                'gender': this.ajaxGender,
                'phone': this.phone,
                'balance_min': this.balance_bound[0],
                'balance_max': this.balance_bound[1],
                'bonus_min': this.bonus_bound[0],
                'bonus_max': this.bonus_bound[1],
            }

            $.ajax({
                'method': 'POST',
                'url': '/api/query_user',
                'data': data,
                'success': function(data) {
                    //TODO:
                    console.log('success!');
                }
            })
        },
        clear: function() {
            for (key in this.$data) {
                this.$data[key] = '';
            }
        },
    },
    computed: {
        balance_bound: function() {
            if (this.balance === '') {
                return ['', ''];
            }
            return this.balance.split('-');
        },
        
        bonus_bound: function() {
            if (this.bonus === '') {
                return ['', ''];
            }
            return this.bonus.split('-');
        },
        ajaxGender: function() {
            if (this.genders.length == 2 || this.genders.length == 0) {
                return -1;
            }
            if (this.genders.indexOf('man') !== -1) {
                return 0;
            }
            return 1;
        }
    }

})