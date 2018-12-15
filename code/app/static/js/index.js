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
    let userid = $('#user-id').val();
    let username = $('#user-name').val();
    let phone = $('#user-phone').val();
    let balance = $('#user-balance').val().split('-');
    let bonus = $('#user-bonus').val().split('-');
    console.log({
        
    })
})