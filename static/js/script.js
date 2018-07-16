const socket = io();
function sendCmdBtn_click() {
    socket.emit('reqCmd', $('#cmdReq').val());
    $('#cmdResultView').append($('#cmdReq').val() + '\n');
    $('#cmdReq').val('');    
};

function cmd_click(cmd, syntax) {
    document.getElementById("syntax").innerHTML = 
    `${cmd}, Syntax: ${syntax}`
};

$('#cmdBox').on('submit', function (e) {
    console.log(e);
    socket.emit('reqCmd', $('#cmdReq').val());
    $('#cmdResultView').append($('#cmdReq').val() + '\n');
    $('#cmdReq').val('');
    e.preventDefault();
});
$('#cmdBox').on('clear', function (e) {
    $('#cmdResultView').clear();
});
$('#clearBtn').on('clear', function (e) {
    $('#reportView').clear();
});
socket.on('resCmd', function (msg) {
    $('#cmdResultView').append(msg + '\n');
    $('#cmdResultView').append('\n\n');
    $('#cmdResultView').scrollTop($('#cmdResultView')[0].scrollHeight);
});
socket.on('report', function (msg) {
    $('#reportView').append(msg + '\n');
    $('#reportView').append('\n\n');
    $('#reportView').scrollTop($('#reportView')[0].scrollHeight);
});


