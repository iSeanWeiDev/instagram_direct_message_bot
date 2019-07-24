'use strict';

$(document).ready(function() {
    var table = $('#example').DataTable();
    var mkConfig = {
        positionY: 'top',
        positionX: 'right',
        max: 15,
        scrollable: false
    };

    mkNotifications(mkConfig);
    
    this.modalUser = function(id) {
        $('#example tbody').on('click', 'tr', function () {
            var data = table.row( this ).data();
            var role = 0;
            switch (data[4]) {
                case 'tier1':
                    role = 1;
                    break;
                case 'tier2':
                    role = 2;
                    break;
                case 'tier3':
                    role = 3;
                    break;
                case 'tier4':
                    role = 4;
                    break;
                case 'admin':
                    role = 5;
                    break;
                default:
                    break;
            }

            $('input#first-name-'+id).val(data[0]);
            $('input#last-name-'+id).val(data[1]);
            $('input#user-name-'+id).val(data[2]);
            $('input#email-'+id).val(data[3]);
            $('select#choose-role-'+id).val(role);
        });
    }

    this.deleteUser = function(id) {
        
        console.log(id);
    }
});
