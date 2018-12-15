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