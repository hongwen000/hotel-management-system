

$('.content:not(:first)').hide();

$('#tab ul li').on('click', function() {
    $('#tab ul li').removeClass('is-active');
    $target = $('#' + $(this).attr('name'));
    $('.content:visible').fadeOut(150, function() {
        $(this).addClass('is-active');
        $target.fadeIn(150);
    })
    // $('.content').hide();
})

let user_app = new Vue({
    el: '#user',
    data: {
        name: '',
        phone: '',
        credential: '',
        balance: '',
        bonus: '',
        genders: [],
        users: []
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
                'method': 'GET',
                'url': '/api/query_user',
                'data': data,
                'success': function(data) {
                    console.log(data);
                    user_app.users = JSON.parse(data.users);
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

let room_app = new Vue({
    el: '#room',
    data: {
        checkin: new Date(),
        checkout: new Date(),
        capacity: '',
        reqs: [],
        // rooms: [{
        //     'id': 123,
        //     'name': 'yanbin',
        //     'age': 20
        // },{
        //     'id': 124,
        //     'name': 'ybyb',
        //     'age': 40
        // }] //result
        rooms: []
    },
    methods: {
        submit: function() {
            let data = {
                'checkin': this.checkin_format,
                'checkout': this.checkout_format,
                'capacity': this.capacity,
                'breakfast': this.reqs.indexOf('breakfast') === -1 ? false : true,
                'wifi': this.reqs.indexOf('wifi') === -1 ? false : true
            };
            console.log(data);
            $.ajax({
                'method': 'POST',
                'url': '', //TODO:
                'data': data,
                'success': function(data) {
                }
            })
        },
        clear: function() {
            this.$data.capacity = '';
            this.$data.checkin = new Date();
            this.$data.checkout = new Date();
            this.$data.rooms = [];
        },
        date2format: function(date) {
            let _date = date.getDate();
            let Month = date.getMonth();
            let Year = date.getFullYear();
            if (_date.length < 2) {
                _date = '0' + _date;
            }
            if (Month.length < 2) {
                Month = '0' + Month;
            }
            return `${Year}-${Month}-${_date}`;

        }
    },
    computed: {
        checkin_format: function() {
            return this.date2format(this.checkin);
        },
        checkout_format: function() {
            return this.date2format(this.checkout);
        }
    }
});

new Vue({
    el: '#logout-app',
    methods: {
        logout: function() {
            $.ajax({
                method: "GET",
                url: '/api/logout'
            });
            window.location.href = '/login';
        }
    }
});