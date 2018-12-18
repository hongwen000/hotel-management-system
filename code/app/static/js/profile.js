let profile_app = new Vue({
    el: '#profile',
    created: function() {
        $.ajax({
            url: '/api/i',
            method: 'GET',
            success: function(res) {
                console.log(res);
                profile_app.username = res.username;
                profile_app.id = res.user_id;
                if (res.error_code !== 0) {
                    profile_app.iserror = true;
                    profile_app.msg = res.error_msg;
                } else {
                    profile_app.iserror = false;
                }
            }
        })
        let data = {
            'user_id': this.id
        };
        console.log(data);
        $.ajax({
            'url': '/api/query_user_info',
            'method': 'POST',
            'data': data,
            'success': function(data) {
                profile_app.credential = data.credential;
                profile_app.gender = data.gender;
                // profile_app.birthdate = data.birthdate;
                profile_app.phone = data.phone;
                profile_app.balance = data.balance;
                profile_app.bonus = data.bonus;
                if (data.error_code !== 0) {
                    profile_app.iserror = true;
                    profile_app.msg = data.error_msg;
                }
            }
        })
    },
    data: {
        username: '',
        id: '',
        readonly: true,
        promt: 'Edit',
        editing: false,
        credential: '',
        gender: 'Male',
        phone: '',
        balance: '',
        bonus: '',
        birthdate: new Date(),
        iserror: false,
        msg: ''
    },
    methods: {
        toggleEdit: function() {
            if (this.editing) {
                // start to save
                this.editing = false;
                this.promt = 'Edit';
                this.save();
            } else {
                // start to edit
                this.editing = true;
                this.promt = 'Save';
            }
        },
        save: function() {
            let data = {
                'user_id': this.id,
                'credential': this.credential,
                'name': this.name,
                'gender': this.gender,
                'birthdate': this.birthdate_format,
                'phone': this.phone,
                'balance': this.balance,
                'bonus': this.bonus
            }
            console.log(data);
            $.ajax({
                'url': '/api/alter_user_info',
                'method': "POST",
                'data': data,
                'success': function(res) {
                    if (res.error_code !== 0) {
                        profile_app.iserror = true;
                    } else {
                        profile_app.iserror = false;
                    }
                    profile_app.msg = res.error_msg;

                }
            })
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
        back: function() {
            window.location.href = '/query';
        }
    },
    computed: {
        birthdate_format: function() {
            return this.date2format(this.birthdate);
        }
    }
});