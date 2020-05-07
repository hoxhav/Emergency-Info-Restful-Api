/*
 * @course ISTE.340.801 - Client Programming
 * @author Vjori Hoxha
 * @version 27.3.2019
 */

/**
 * When window loads, the organization types are loaded together with cities, and search form is being given a click event
 * @type type window on load
 */
$(window).on("load", function () {
    getOrgTypes();
    getCities($('#stateSelect').val());
    $('#stateSelect').on('change', function () {
        getCities($(this).val());
    });
    $('#searchButton').on('click', search);
});

/**
 * This methods is onchange event for the location select created, which every time an option is selected
 * it hides all containers with the class locations but shows the container with class which has the same class name as the selected index
 * that's how they are connected
 * @returns {undefined}
 */
function testLocation() {
    $(".locations").css("display", "none");
    $('.' + $("#locationSelect option:selected").index()).show();
}

/**
 * This method is onchange event for people select, which uses the same logic as the above location method
 * @returns {undefined}
 */
function peopleSelect() {
    $(".people").css("display", "none");
    $('.peep' + $("#peopleSelect option:selected").index()).show();
}

/**
 * Gets the organization types from Simon and appends them to a select
 * @returns {undefined}
 */
function getOrgTypes() {
    $.ajax({
        method: "GET",
        async: true, //default is true
        cache: false, //default is true
        //url: "http://localhost:8000/.../p2-start/proxy.php?path=/OrgTypes&_=1551669226768"
        //url: "http://simon.ist.rit.edu:8080/Services/resources/ESD/OrgTypes",
        data: {path: "/OrgTypes"},
        url: "proxy.php",
        dataType: "xml",
        success: function (response, status) { //response: XMLDocument
            if ($(response).find('error').length === 0) {
                console.log('There was an error with loading org type'); //developer purpose;
            }
            let options = '';
            options += '<option value="">-- All Organization Types --</option>';
            $(response).find('type').each(function () {
                options += '<option value="' + $(this).text() + '">' + $(this).text() + '</option>';
            });
            $('#orgTypeSelect').html(options);
        }
    });
}

/**
 * Gets the state cities. 
 * 
 * @param {type} state
 * @returns {undefined}
 */
function getCities(state) {
    $.ajax({
        method: "GET",
        cache: false,
        url: "proxy.php",
        data: {path: "/Cities?state=" + state},
        dataType: "xml",
        success: function (response, status) {
            let options = "";
            options += "<option value=''>" + "-- All Cities --" + "</option>";
            $('row', response).each(function () {
                options += "<option value='" + $(this).find('city').text()
                        + "'>" + $(this).find('city').text() + "</option>";
            });
            $('#citySelect').html(options);

        }
    });
}

/**
 * After you click search, it will serialize the form and gets the input from form, and all the result will
 * show in three plugins: in a table, after you click the name of the organization it will use Tabs plugin which will be
 * retrieved from Simon depending on what was clicked, and each tab will be populated with data for that organization and tab.
 * ALl these data from tabs will be shown in a dialog which is a jquery plugin too.
 * @returns {undefined}
 */
function search() {
    $.ajax({
        method: "GET",
        cache: false,
        url: "proxy.php",
        data: {path: "/Organizations?" + $('#searchForm').serialize()},
        dataType: "xml",
        beforeSend: function () {
            //The custom Jquery plugin created from me, which shows a running gear image
            //given to us from inclass from prof. Marasovic
            $('#searchForm').appendImage();
        },
        success: function (response, status) {
            let records = '';
            $('#searchResultTable').html('');
            if ($(response).find('error').length !== 0) {
                $('error', response).each(function () {
                    records += "error getting data";
                });
            } else if ($(response).find('row').length === 0) { //if no records found
                records = 'No data matches for: ' + $('#orgTypeSelect').val() + ' > State: ' + $('#stateSelect').val() + ' > City: ' + $('#citySelect').val();
            } else if ($("#orgTypeSelect").val() === "Physician") { //if orgType Physician
                records += '<table id="example" class="display" style="width:100%">';
                records += '<thead><tr><th>First Name</th><th>Middle Name</th><th>Last Name</th><th>Type</th><th>Name</th><th>City</th><th>Zip</th><th>County</th><th>State</th><th>Phone</th></tr></thead>';
                records += '<tbody>';
                $('row', response).each(function () {
                    records += '<tr>';
                    records += '<td>' + $(this).find('fName').text() + '</td>';
                    records += '<td>' + $(this).find('mName').text() + '</td>';
                    records += '<td>' + $(this).find('lName').text() + '</td>';
                    records += '<td>' + $(this).find('type').text() + '</td>';
                    records += '<td style="text-decoration: underline black;" onclick="openDialog(' + $(this).find('OrganizationID').text() + ')">'
                            + $(this).find('Name').text() + '</td>';
                    records += '<td>' + $(this).find('city').text() + '</td>';
                    records += '<td>' + $(this).find('zip').text() + '</td>';
                    records += '<td>' + $(this).find('CountyName').text() + '</td>';
                    records += '<td>' + $(this).find('State').text() + '</td>';
                    records += '<td>' + $(this).find('phone').text() + '</td>';
                    records += '</tr>';
                });
                records += '</tbody>';
                records += '</table>';
            } else {
                records += '<table id="example" class="display" style="width:100%">';
                records += '<thead><tr><th>Type</th><th>Name</th><th>Email</th><th>City</th><th>Zip</th><th>County</th><th>State</th></tr></thead>';
                records += '<tbody>';
                $('row', response).each(function () {
                    records += '<tr>';
                    records += '<td>' + $(this).find('type').text() + '</td>';
                    records += '<td style="text-decoration: underline black;" onclick="openDialog(' + $(this).find('OrganizationID').text() + ')">'
                            + $(this).find('Name').text() + '</td>';
                    records += '<td>' + $(this).find('Email').text() + '</td>';
                    records += '<td>' + $(this).find('city').text() + '</td>';
                    records += '<td>' + $(this).find('zip').text() + '</td>';
                    records += '<td>' + $(this).find('CountyName').text() + '</td>';
                    records += '<td>' + $(this).find('State').text() + '</td>';
                    records += '</tr>';
                });
                records += '</tbody>';
                records += '</table>';
            }
            //The data is pulled fast from our fast internets and computers, do if you comment the remove line, you will see the wheel spinning (custom plugin)
            $('#load').remove();
            $('#searchResultTable').append(records);
            $('#example').DataTable();
        }
    });
}

/**
 * Based on clicked organization it will pull the tabs for that org
 * @param {type} id of the organization
 * @returns {undefined}
 */
function getTabsID(id) {
    $.ajax({
        method: "GET",
        cache: false,
        url: "proxy.php",
        data: {path: "/Application/Tabs?orgId=" + id},
        dataType: "xml",
        success: function (response, status) {
            let counter = 1;
            $('row', response).each(function () {
                $('.simpleTabs').append('<div id="' + $(this).find('Tab').text() + '" data-st-title="' + $(this).find('Tab').text() + '"></div>');
            });
            //Even though these functions are being called, if the Organization does not have some of the tabs
            //the method will not go through
            //These function calls will make sure that all possible tabs will be called and the organization will use
            //the alread predefined Simon methods
            getGeneral($('#General'), id);
            getLocations($('#Locations'), id);
            getTreatment($('#Treatment'), id);
            getTraining($('#Training'), id);
            getFacilities($('#Facilities'), id);
            getPhysicians($('#Physicians'), id);
            getPeople($('#People'), id);
            getEquipment($('#Equipment'), id);
            $('.simpleTabs').simpleTabs(); //call tabs plugin which will take care of the design of the tabs
        },
        complete: function () {
            //When you close the dialog all the data will be deleted for that dialog
            //so if user clicks another org the data will be added again for that organization
            $("#dialog").on("dialogbeforeclose", function (event, ui) {
                if ($('#dialog').children().length > 0) {
                    $('#tabs').empty();
                }
            });
        }
    });
}

/**
 * This function is being triggered onclick when you click name of the organization
 * based on the id of clicked organization the dialog with tabs will open
 * @param {type} id
 * @returns {undefined}
 */
function openDialog(id) {
    getTabsID(id);
    $("#dialog").dialog({
        width: 1000,
        maxHeight: 600
    });
}