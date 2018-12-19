let profile_app = new Vue({
    el: '#profile',
    mounted: function() {
        $.ajax({
            'url': '/api/i',
            'method': 'GET',
            // 'async': false,
            'success': function(res) {
                console.log(res);
                profile_app.username = res.username;
                profile_app.id = res.user_id;
                if (res.error_code !== 0) {
                    profile_app.iserror = true;
                    console.log('error at i')
                    profile_app.msg = res.error_msg;
                } else {
                    profile_app.iserror = false;
                }

                let data = {
                    'user_id': profile_app.id
                };
                console.log(data);
                $.ajax({
                    'url': '/api/query_user_info',
                    'method': 'POST',
                    'data': data,
                    'success': function(data) {
                        profile_app.credential = data.credential;
                        profile_app.gender = data.gender === 1 ? "Male" : "Female";
                        // profile_app.birthdate = data.birthdate; //TODO:
                        profile_app.phone = data.phone;
                        profile_app.balance = data.balance;
                        profile_app.bonus = data.bonus;
                        profile_app.nickname = data.name;
                        if (data.error_code !== 0) {
                        console.log('error at query user info')
                            profile_app.iserror = true;
                            profile_app.msg = data.error_msg;
                        } else {
                            profile_app.iserror = false;
                        }
                    }
                });
            }
        });
    },
    data: {
        username: '',
        nickname: '',
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
                'name': this.nickname,
                'gender': this.gender === 'Male' ? 1 : 0,
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
                        profile_app.msg = res.error_msg;
                        profile_app.toggleEdit();
                    } else {
                        profile_app.iserror = false;
                        profile_app.msg = 'success';
                    }

                }
            })
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