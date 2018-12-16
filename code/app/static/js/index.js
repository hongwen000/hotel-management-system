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
        users: [],
        iserror: false,
        msg: ''
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
        insert: function() {
            let data = {
                'credential': this.credential,
                'name': this.name,
                'gender': this.ajaxGender,
                'birthdate': '',
                'phone': this.phone,
                'balance': this.balance,
                'bonus': this.bonus
            };
            $.ajax({
                'url': '/api/insert_user',
                'method': 'POST',
                'data': data,
                'success': function(data) {
                    if (data.error_code === 0) {
                        user_app.iserror = false;
                        user_app.msg = data.error_msg;
                    } else {
                        user_app.iserror = true;
                        user_app.msg = data.error_msg;
                    }
                }
            })
        }
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
        iserror: false,
        msg: '',
        room_id: '',
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
        insert: function() {
            let data = {
                'floor': this.floor,
                'room_num': this.room_num,
                'price': this.price,
                // 'type_id': 
                //TODO:
            }
        },
        remove: function() {
            let data = {
                'room_id': this.room_id
            };
            $.ajax({
                'url': '/api/drop_room',
                'method': 'POST',
                'data': data,
                'success': this.success
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

        },
        success: function(data) {
            if (data.error_code === 0) {
                this.iserror = false;
            } else {
                this.iserror = true;
            }
            this.msg = data.msg;
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
    el: '#bars',
    methods: {
        logout: function() {
            $.ajax({
                method: "GET",
                url: '/api/logout'
            });
            window.location.href = '/login';
        },
        profile: function() {
            window.location.href = '/profile';
        }
    }
});

let root_app = new Vue({
    el: '#root',
    data: {
        query: '',
        output: '',
        table: '',
        error: false
    },
    methods: {
        submit: function() {
            $.ajax({
                method: 'POST',
                url: '/api/query',
                data: {
                    query: this.query
                },
                success: function(data) {
                    if (data.error_code === 0) {
                        root_app.output = JSON.parse(data.data);
                        root_app.table = JSON.parse(data.data);
                        root_app.error = false;
                    } else {
                        root_app.output = JSON.parse(data.data);
                        root_app.table = '';
                        root_app.error = true;
                    }
                }
            })
        }
    }
})