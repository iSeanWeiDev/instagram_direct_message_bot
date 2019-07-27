'use strict';

$(document).ready(function () {
    $('#example').DataTable();

    $('select#botTypeFilter.form-control').change(function() {
        var state = $(this).children("option:selected");
        var id = state.val().split('-')[1];
        var flag = state.val().split('-')[0];

        var sendData = {
            id: id,
            flag: flag
        }

        $.ajax({
            method: 'POST',
            url: '/admin/get/botsbytype',
            data: sendData
        }).done(function(response) {
            if(response && response.flag == true) {
                var strAppendHtml = '';
                for(var obj of response.data) {
                    var strStyle = '';
                    var strImageUrl = '';
                    var strIconUrl = '';
                    var strIsActivate = '';

                    switch (obj.state) {
                        case 0:
                            strStyle = 'text-primary';
                            strImageUrl = 'assets/images/action_images/deleted_bot.png';
                            strIconUrl = 'assets/images/action_images/Deleted.png';
                            break;
                    
                        case 1:
                            strStyle = 'text-success';
                            strImageUrl = 'assets/images/action_images/activated_bot.png';
                            strIconUrl = 'assets/images/action_images/Activated.png';
                            break;
                            
                        case 2:
                            strStyle = 'text-warning';
                            strImageUrl = 'assets/images/action_images/action_required_bot.png';
                            strIconUrl = 'assets/images/action_images/ActionSpamError.png';
                            break;

                        case 3:
                            strStyle = 'text-warning';
                            strImageUrl = 'assets/images/action_images/action_required_bot.png';
                            strIconUrl = 'assets/images/action_images/RequestError.png';
                            break;

                        case 4:
                            strStyle = 'text-danger';
                            strImageUrl = 'assets/images/action_images/action_required_bot.png';
                            strIconUrl = 'assets/images/action_images/CheckPointError.png';
                            break;

                        case 5:
                            strStyle = 'text-danger';
                            strImageUrl = 'assets/images/action_images/blocked_bot.png';
                            strIconUrl = 'assets/images/action_images/SentryBlockError.png';
                            break;

                        case 6:
                            strStyle = 'text-warning';
                            strImageUrl = 'assets/images/action_images/action_required_bot.png';
                            strIconUrl = 'assets/images/action_images/ParseError.png';
                            break;

                        case 7:
                            strStyle = 'text-warning';
                            strImageUrl = 'assets/images/action_images/action_required_bot.png';
                            strIconUrl = 'assets/images/action_images/TypeError.png';
                            break;
                            
                        default:
                            break;
                    }

                    if(obj.is_activated == 'Y') {
                        strIsActivate = 'mdi mdi-pause';
                    } else {
                        strIsActivate = 'mdi mdi-play';
                    }

                    
                    strAppendHtml +=    `   <div class="col-md-3 mb-3">
                                                <div class="card text-center">
                                                    <div class="card-image">
                                                        <img src="` + strImageUrl + `" width="100%">
                                                    </div>
                                                    <div class="card-body p-2">
                                                        <h5 class="` + strStyle + ` p-0">
                                                            <strong>
                                                                ` + obj.bot_name + `
                                                            </strong>
                                                        </h5>
                                                        <div class="row">
                                                            <div class="col-md-3 text-center">
                                                                <img src="` + strIconUrl + `" style="width: 35px;" alt="">
                                                            </div>
                                                            <div class="col-md-9">
                                                                <button class="btn btn-outline-primary btn-rounded">
                                                                    <i class="` + strIsActivate + `" style="font-size: 20px;"></i>
                                                                </button>
                                                                <button class="btn btn-warning btn-rounded">
                                                                    <i class="mdi mdi-settings" style="font-size: 20px;"></i>
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>`; 
                }

                $('div#modal'+id+'.row').html(strAppendHtml);

                strAppendHtml = '';
            }
        });
    });
});