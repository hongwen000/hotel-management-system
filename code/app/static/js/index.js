let username;
let role;
let user_id;
$.ajax({
    url: '/api/i',
    method: 'GET',
    success: function(data) {
        username = data.username;
        role = data.role;
        user_id = data.user_id
        if (role === 3) {
            $('#tab-user').hide();
        }
        if (role !== 0) {
            $('#tab-root').hide();
        }
    },
    async: false
});



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
        msg: '',
        role: role,
        birthdate: new Date(),
    },
    // created: function() {
    //     $.ajax({
    //         'url': '/api/i',
    //         'method': 'GET',
    //         'success': function(data) {
    //             user_app.role = data.role;
    //         }
    //     })
    // },
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
            birthdate = new Date();
        },
        date2format: function(date) {
            let _date = date.getDate();
            let Month = '' + (parseInt(date.getMonth()) + 1);
            let Year = date.getFullYear();
            if (_date.length < 2) {
                _date = '0' + _date;
            }
            if (Month.length < 2) {
                Month = '0' + Month;
            }
            return `${Year}-${Month}-${_date}`;

        },
        insert: function() {
            let data = {
                'credential': this.credential,
                'name': this.name,
                'gender': this.ajaxGender,
                'birthdate': this.date2format(this.birthdate),
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
        rooms: [],
        room_types: [],
        room_types2id: {},
        add_type: '',
        selected_room_type: '',
        price: '',
        floor: '',
        role: role
    },
    created: function() {
        $.ajax({
            'url': '/api/get_room_type',
            'method': 'GET',
            'success': function(data) {
                let d = JSON.parse(data.types);
                for (let i = 0; i < d.length; ++i) {
                    console.log(d[i]);
                    room_app.room_types.push(d[i].name);
                    room_app.room_types2id[d[i].name] = d[i].id;
                }
            }
        })
    },
    methods: {
        submit: function() {
            let data = {
                'check_in': this.checkin_format,
                'check_out': this.checkout_format,
                'capacity': this.capacity,
                'breakfast': this.reqs.indexOf('breakfast') === -1 ? '' : '1',
                'wifi': this.reqs.indexOf('wifi') === -1 ? '' : '1'
            };
            console.log(data);
            $.ajax({
                'method': 'POST',
                'url': '/api/query_avail_room', 
                'data': data,
                'success': function(data) {
                    room_app.rooms = JSON.parse(data.rooms);
                    if (data.error_code !== 0) {
                        room_app.msg = data.error_msg;
                        room_app.iserror = true;
                    } else {
                        room_app.iserror = false;
                    }
                }
            })
        },
        order: function() {
            let data = {
                'room_id': this.room_id,
                'user_id': user_id,
                'check_in': this.checkin_format,
                'check_out': this.checkout_format
            }
            console.log(data);
            $.ajax({
                'method': 'POST',
                'url': '/api/order_room',
                'data': data,
                'success': function(data) {
                    if (data.error_code == 0) {
                        room_app.iserror = false;
                    } else {
                        room_app.iserror = true;
                    }
                    room_app.msg = data.error_msg
                    room_app.submit();
                }
            });
        },
        order_click(id) {
            console.log(id);
            this.room_id = id;
            this.order();
        },
        insert: function() {
            let data = {
                'floor': this.floor,
                'room_num': this.room_id,
                'price': this.price,
                'type_id': this.room_types2id[this.selected_room_type]
            }
            console.log(data);
            $.ajax({
                'url': '/api/insert_room',
                'method': 'POST',
                'data': data,
                'success': this.success
            })
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
        add_room_type: function() {
            let data = {
                'name': this.add_type,
                'capacity': this.capacity,
                'wifi': this.wifi ? 1 : 0,
                'breakfast': this.breakfast ? 1 : 0
            }

            $.ajax({
                'url': '/api/insert_room_type',
                'method': 'POST',
                'data': data,
                'success': this.success
            });

        },
        clear: function() {
            this.$data.capacity = '';
            this.$data.checkin = new Date();
            this.$data.checkout = new Date();
            this.$data.rooms = [];
        },
        date2format: function(date) {
            let _date = date.getDate();
            let Month = '' + (parseInt(date.getMonth()) + 1);
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
            this.msg = data.error_msg;
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
        error: false,
        role: role
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

let order_app = new Vue({
    el: '#order',
    data: {
        username: username,
        bdate: new Date(),
        edate: new Date(),
        orderid: '',
        floor: '',
        room_num: '',
        user_id: '',
        result: [],
        msg: '',
        iserror: false,
        role: role,
        show_modal: false,
        order_detail_msg: ['hello world']
    },
    methods: {
        submit: function() {
            if (role <= 1) {
                let data = {
                    order_id: this.orderid,
                    time_min: this.date2format(this.bdate),
                    time_max: this.date2format(this.edate),
                    floor: this.floor,
                    room_num: this.room_num,
                    user_id: this.user_id,
                    name: this.username
                }
                console.log(data);

                $.ajax({
                    url: '/api/query_order',
                    method: 'POST',
                    data: data,
                    success: function(data) {
                        if (data.error_code === 0) {
                            order_app.result = JSON.parse(data.orders);
                            for (let i = 0; i < order_app.result.length; ++i) {
                                if (order_app.result[i].status === 1) {
                                    order_app.result[i].status = 'Valid';
                                } else {
                                    order_app.result[i].status = 'Canceled';
                                }
                            }
                            order_app.iserror = false;
                        } else {
                            order_app.iserror = true;
                            order_app.msg = data.error_msg;
                        }
                    }
                });
            } else {
                let data = {
                    'user_id': user_id,
                    'check_in': this.date2format(this.bdate),
                    'check_out': this.date2format(this.edate)
                };
                console.log(data);
                $.ajax({
                    'method': 'POST',
                    'url': '/api/query_order_by_user',
                    'data': data,
                    'success': function(data) {
                        if (data.error_code === 0) {
                            order_app.iserror = false;
                        } else {
                            order_app.iserror = true;
                        }
                        order_app.msg = data.error_msg;
                        order_app.result = JSON.parse(data.orders);
                    }
                })
            }
        },
        clear: function() {
            for (key in this.$data) {
                this.$data[key] = '';
            }
            this.$data.bdata = new Date();
            this.$data.edata = new Date();
        },
        date2format: function(date) {
            console.log(date);
            let _date = date.getDate();
            let Month = '' + (parseInt(date.getMonth()) + 1);
            let Year = date.getFullYear();
            if (_date.length < 2) {
                _date = '0' + _date;
            }
            if (Month.length < 2) {
                Month = '0' + Month;
            }
            return `${Year}-${Month}-${_date}`;

        },
        cancel: function(id) {
            let data = {
                'order_id': id
            };
            console.log(data);
            $.ajax({
                'url': '/api/cancel_order',
                'method': 'POST',
                'data': data,
                'success': function(res) {
                    if (res.error_code === 0) {
                        order_app.iserror = false;
                    } else {
                        order_app.iserror = true;
                    }
                    order_app.msg = res.error_msg;
                    for (let i = 0; i < order_app.result.length; ++i) {
                        if (order_app.result[i].id === id) {
                            order_app.result[i].status = 0;
                        }
                    }
                }
            });
        },
        click_modal: function() {
            console.log('hide');
            this.show_modal = false;
        },
        click_row: function(id) {
            let data = {
                'order_id': id
            };
            console.log(data);
            $.ajax({
                'url': '/api/query_order_operations',
                'method': 'POST',
                'data': data,
                'success': function(res) {
                    order_app.show_modal = true;
                    order_app.order_detail_msg = ['belows are operations'];
                    let res_obj = JSON.parse(res.orders);
                    console.log(res_obj);
                    for (let item of res_obj) {
                        console.log(item);
                        let id = item.id;
                        let time = item.time;
                        let detail = item.detail === 1 ? 'Booked' : 'Canceled';
                        order_app.order_detail_msg.push(`(${id})  at   ${time}   you   ${detail}   the Rooms\n`);
                    }
                }
        
            })
            
        }
        // success: function(data) {
        //     if (error_code === 0) {
        //         this.result = JSON.parse(data.orders);
        //         this.msg = data.error_msg;
        //         this.i
        //     }
        // }
    }
})