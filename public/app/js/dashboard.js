'use strict';

$(document).ready(function() {
    initGetData();
    
    function initGetData() {
        var state = $('select#dayFilter.form-control').children("option:selected");
        var sendData = {
            state: state.val()
        }
        $.ajax({
            type: 'POST',
            url: '/board/get/init',
            data: sendData,
            dataType: 'JSON'
        }).done(function(response) {
            if(response && response.flag) {
                if(response.data.length == 0) {
                    $('div#dialogDiv').html('<div class="col-12 text-center pt-3 text-danger font-weight-bold"> \
                                                        <label class="pl-3 pt-2 pr-3 pb-2 border-danger" style="border: 3px solid;"> \
                                                        No data to display \
                                                        </label> \
                                                    </div>');
                    $('div#commentDiv').append('<div class="col-12 text-center pt-3 text-danger font-weight-bold"> \
                                                        <label class="pl-3 pt-2 pr-3 pb-2 border-danger" style="border: 3px solid;"> \
                                                        No data to display \
                                                        </label> \
                                                    </div>');
                } else {
                    for(var obj of response.data) {
                        if(obj.type == 'reply') {
                            $('tbody#dialogTbody').append('<tr class="text-center align-middle"> \
                                                                <th scope="row">' + 
                                                                    obj.botname +
                                                                '</th> \
                                                                <td class=""> \
                                                                    <strong> ' +
                                                                    obj.count +
                                                                    '</strong> \
                                                                </td> \
                                                            </tr>');
                        }
    
                        if(obj.type == 'comment') {
                            $('tbody#commentTbody').append('<tr class="text-center align-middle"> \
                                                                <th scope="row">' + 
                                                                    obj.botname +
                                                                '</th> \
                                                                <td class=""> \
                                                                    <strong> ' +
                                                                    obj.count +
                                                                    '</strong> \
                                                                </td> \
                                                            </tr>');
                        }
                    }
                }



               
            }
        });
    }

    $('select#dayFilter.form-control').change(function() {
        var state = $(this).children("option:selected");
        var sendData = {
            state: state.val()
        }

        $.ajax({
            type: 'POST',
            url: '/board/get/init',
            data: sendData,
            dataType: 'JSON'
        }).done(function(response) {
            if(response && response.flag) {
                // Initialize the display.
                $('tbody#dialogTbody').html('');
                $('tbody#commentTbody').html('');
                $('div#dialogDiv').html('');
                $('div#commentDiv').html('');

                if(response.data.length == 0) {
                    $('div#dialogDiv').append('<div class="col-12 text-center pt-3 text-danger font-weight-bold"> \
                                                        <label class="pl-3 pt-2 pr-3 pb-2 border-danger" style="border: 3px solid;"> \
                                                        No data to display \
                                                        </label> \
                                                    </div>');
                    $('div#commentDiv').append('<div class="col-12 text-center pt-3 text-danger font-weight-bold"> \
                                                        <label class="pl-3 pt-2 pr-3 pb-2 border-danger" style="border: 3px solid;"> \
                                                        No data to display \
                                                        </label> \
                                                    </div>');
                } else {
                    for(var obj of response.data) {
                        if(obj.type == 'reply') {
                            
                            $('tbody#dialogTbody').append('<tr class="text-center align-middle"> \
                                                                <th scope="row">' + 
                                                                    obj.botname +
                                                                '</th> \
                                                                <td class=""> \
                                                                    <strong> ' +
                                                                    obj.count +
                                                                    '</strong> \
                                                                </td> \
                                                            </tr>');
                        }

                        if(obj.type == 'comment') {
                            $('tbody#commentTbody').append('<tr class="text-center align-middle"> \
                                                                <th scope="row">' + 
                                                                    obj.botname +
                                                                '</th> \
                                                                <td class=""> \
                                                                    <strong> ' +
                                                                    obj.count +
                                                                    '</strong> \
                                                                </td> \
                                                            </tr>');
                        }
                    }
                }
            }
        });
    });
 });

 