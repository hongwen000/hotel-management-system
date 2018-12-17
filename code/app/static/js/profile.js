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
            }
        })
    },
    data: {
        username: '',
        id: '',
        readonly: true,
        promt: 'Edit',
        editing: false
    },
    methods: {
        toggleEdit: function() {
            if (this.editing) {
                this.editing = false;
                this.promt = 'Edit';
            } else {
                this.editing = true;
                this.promt = 'Save';
            }
        },
    }
});