$('#q-button').on('click', function() {
    let text = $('#query').val();
    $.ajax({
        method: 'POST',
        url: '/api/query',
        data: {
            query: text
        },
        success: function(data) {
            console.log(data);
            $('#output').val(JSON.stringify(data.data));
        }

    });
});

$('.content').hide();
$('#user').show();

$('#tab ul li').on('click', function() {
    $('#tab ul li').removeClass('is-active');
    $(this).addClass('is-active');
    $('.content').hide();
    $('#' + $(this).attr('name')).show();
})

$('#user-submit').on('click', function() {
    let isMan = document.getElementById("user-isman").checked;
    let isWoman = document.getElementById("user-iswoman").checked;
    let gender;
    if (isMan && isWoman){
        gender = -1;
    } else if (isMan) {
        gender = 0;
    } else {
        gender = 1;
    }
    let username = $('#user-name').val();
    let phone = $('#user-phone').val();
    let balance = $('#user-balance').val();
    if (balance !== '') {
        balance = balance.split('-');
    } else {
        balance = [-1, -1];
    }
    let bonus = $('#user-bonus').val();
    if (bonus !== '') {
        bonus = bonus.split('-');
    } else {
        bonus = [-1, -1];
    }
    let credential = $('#user-credential').val();
    let data = {
        'credential': credential,
        'name': username,
        'gender': gender,
        'phone': phone,
        'balance_min': balance[0],
        'balance_max': balance[1],
        'bonus_min': bonus[0],
        'bonus_max': bonus[1]
    }
    console.log(data);

    $.ajax({
        'method': 'POST',
        'url': '/api/query_user',
        'data': data,
        'success': function() {
            //TODO:
            console.log('success!');
        }
    })
})