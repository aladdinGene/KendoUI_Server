let top_id = 0, AssignmentFunctionData = [], HazardData = [], assignmentRoleData, condition_results, condition_results_value, sPermissionResult, systemRolesValue, systemPositionsValue, sPermission;

var refTreeList
var dataSourceMasterType = [
        { "text": "Assignment Function", "value": "Assignment Function" },
        { "text": "Hazard", "value": "Hazard" }
    ];

var field_order = new Array();


var loader = $('#loader').kendoLoader({
        themeColor:'primary',
        type: "converging-spinner"
    }).data("kendoLoader");
//================== MSAL Auth Block Start =============
var EMRSconfig={
    clientId: "cfc9f18c-9a43-4d6a-a556-f338be15619d",
    authority: "https://login.microsoftonline.com/171d96c1-7170-4561-a662-66c07e043e23",
    // redirectUri: "https://www.emdemos.com/EMRSAdmin",
    redirectUri: "https://kendoui.azurewebsites.net",
    // redirectUri: "http://localhost:44354",
    scopes: ["api://7b78a6e1-50a5-475d-b109-d7c18b63f513/EMRS_API"]
};
var loginRequest = {
        scopes: EMRSconfig.scopes
 };
const msalConfig = {
        auth: {
            clientId: EMRSconfig.clientId,
            authority: EMRSconfig.authority,
            redirectUri: EMRSconfig.redirectUri
        },
        cache: {
            cacheLocation: "sessionStorage", // This configures where your cache will be stored
            storeAuthStateInCookie: false, // Set this to "true" if you are having issues on IE11 or Edge
        }
    };
    
const myMSALObj = new msal.PublicClientApplication(msalConfig);
let username = "";

function handleResponse(resp) {
    if (resp !== null) {
        username = resp.account.username
        fetchMasterType()
    } else {
        /**
         * See here for more info on account retrieval: 
         * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-common/docs/Accounts.md
         */
        const currentAccounts = myMSALObj.getAllAccounts();
        if (currentAccounts === null || currentAccounts.length==0)
            myMSALObj.loginRedirect(loginRequest);
        else 
        {
            username = currentAccounts[0].username;
            fetchMasterType()
        }
    }
}

document.addEventListener('DOMContentLoaded', (event) => {
    myMSALObj.handleRedirectPromise().then(handleResponse).catch(err => {
        console.error(err);
    });
});

function getTokenRedirect(request) {
    /**
     * See here for more info on account retrieval: 
     * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-common/docs/Accounts.md
     */
    request.account = myMSALObj.getAccountByUsername(username);
    return myMSALObj.acquireTokenSilent(request).catch(error => {
        console.warn("silent token acquisition fails. acquiring token using redirect");
        if (error instanceof msal.InteractionRequiredAuthError) {
            // fallback to interaction when silent call fails
            return myMSALObj.acquireTokenRedirect(request);
        } else {
            console.warn(error);   
        }
    });
}
let referenceDatas = []
let urls = []
async function fetchMasterType()
{
    getTokenRedirect(loginRequest).then(response => {
        fetch(' https://emrsapi.azurewebsites.net/api/graphql', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            "Authorization": "Bearer " + response.accessToken
          },
          body: JSON.stringify({query:"{mastertypes(iseditible:true){id,name,parentid,displayname}}"})
        })
        .then(response => response.json())
        .then(data => {
            referenceDatas = data.data.mastertypes
            for(var i=0;i<referenceDatas.length;i++){
                referenceDatas[i].Name = referenceDatas[i].displayname
            }
            for(var i=0;i<referenceDatas.length;i++){
                urls.push(referenceDatas[i])
                if(referenceDatas[i].parentid == 0) {
                    referenceDatas[i].parentid = null
                    urls[i].parentid = null
                    referenceDatas[i].isMaster = true
                } else {
                    for(var j=0;j<referenceDatas.length;j++){
                        if(referenceDatas[i].parentid == referenceDatas[j].id) {
                            urls[urls.length - 1].parentName = referenceDatas[j].name
                            break;
                        }
                    }
                }
            }
        }).then(data => {
            fetchData()
        })
        .catch((error) => {
            console.log(error)
        });
        
    }).catch(error => {
        kendo.alert("You don’t have access to EMRS Reference Data, please contact the Administrator.");
    });
    
}


var fetchData = async () => {
    let myPromise = new Promise(async function(myResolve, myReject) {
        var total_index = urls.length
        var present_index = 0
        try {
            const response = await Promise.all(urls.map((url, url_index) =>{
                getTokenRedirect(loginRequest).then(response => {
                    fetch('https://emrsapi.azurewebsites.net/api/referenceData/items/' + url.name, {
                      method: 'GET',
                      headers: {
                        'Content-Type': 'application/json',
                        "Authorization": "Bearer " + response.accessToken
                      },
                    })
                    .then(response => response.json())
                    .then(data => {
                        if(data.value) {
                            present_index++
                            var temp_data = data.value
                            total_index += temp_data.length;
                            console.log(present_index, total_index, urls.length)
                            for(var i=0;i<temp_data.length;i++){
                                var temp_data_row = temp_data[i]
                                temp_data_row.id = url.id * 10000 + temp_data_row.Id
                                temp_data_row.masterType = url.id
                                temp_data_row.masterName = url.displayname
                                if(url.parentid == null) {
                                    temp_data_row.parentid = url.id
                                } else {
                                    temp_data_row.parentid = url.parentid * 10000 + temp_data_row[url.parentName + 'Id']
                                }
                                referenceDatas.push(temp_data_row)
                                if((referenceDatas.length == total_index) && (present_index == urls.length)){
                                    myResolve()
                                }
                            }
                        } else {
                            present_index++
                            if((referenceDatas.length == total_index) && (present_index == urls.length)){
                                myResolve()
                            }
                        }
                    })
                    .catch((error) => {
                        console.log(error)
                    });
                    
                }).catch(error => {
                    $('#loader-wrap').addClass('hide')
                    kendo.alert("You don’t have access to EMRS Reference Data, please contact the Administrator.");
                });
            })).then(async (json)=> {
                
            })
        } catch (error) {
            console.error(error);
        }
    }).then(() => {
        $('#loader-wrap').addClass('hide')
        referenceTreeInit()
    })
}


function referenceTreeInit(){

    var url_length = urls.length
    for(var i=0;i<url_length;i++){
        if(referenceDatas[i].parentid != null){
            referenceDatas.splice(i,1);
            i--
            url_length--
        }
    }
    var aaa=referenceDatas.length;
    console.log(aaa)
    var dataSource = new kendo.data.TreeListDataSource({
        transport: {
            read: async function(e) {
                e.success(referenceDatas)
            },
            update: function(e) {
                let updatedItem = e.data.models;
                e.success();
            },
            destroy: function(e) {
                e.success();
            },
            create: function(e) {
                e.success(e.data.models);
            },
            edit: function(e) {
                e.container.data("kendoWindow").title("Custom Title");
            },
            parameterMap: function(options, operation) {
                if (operation !== "read" && options.models) {
                    return {models: kendo.stringify(options.models)};
                }
            }
        },
        batch: true,
        schema: {
            model: {
                id: "id",
                parentId: "parentid",
                fields: {
                    id: { type: "Number", editable: false, nullable: false },
                    parentid: { type: "Number", editable: false, nullable: true},
                },
            }
        },
        sort: [
            // sort by "category" in descending order and then by "name" in ascending order
            { field: "OrderId", dir: "asc" },
            { field: "id", dir: "asc" }
        ],
        pageSize: 15
    });
    

    refTreeList = $("#treelist").kendoTreeList({
        dataSource: dataSource,
        toolbar: $("#reference-toolbar-template").html(),
        editable: {
            mode: "popup",
            template: $("#popup-template").html(),
            move: {
                reorderable: true
            }
        },
        edit: function(e) {
            if (e.model.isNew()) {
                e.container.data("kendoWindow").title("Add");
                e.container.find(".k-button.k-grid-update").html('<span class="k-icon k-i-check"></span>Add')
            } else {
                e.container.find(".k-button.k-grid-update").html('<span class="k-icon k-i-check"></span>Edit')
            }
        },
        filterable: true,
        sortable: true,
        resizable: true,
        reorderable: true,
        navigatable: true,
        columnMenu: true,
        columns: [{
            title: "EMS",
            columns: [
                { field: "Name", expandable: true, title: "Name", width: 200},
                { field: "masterName", title: "Master Type", width: 150},
                { field: "id", title: "ID", template: $("#id-template").html()},
                { field: "EmsCode", title: "EMS Code"},
                { field: "EmsName", title: "EMS Name"},
                { field: "SyncToEms", title: "EMS sync", template: $("#ems-sync-template").html()}
            ]
        }, {
            title: "VSHOC",
            columns: [
                { field: "vShocCode", title: "VSHOC Code"},
                { field: "vShocName", title: "VSHOC Name"},
                { field: "SyncTovShoc", title: "vShoc sync", template: $("#vshoc-sync-template").html()}
            ]
        }, {
            title: 'Actions',
            template: function (dataItem) {
                let buttons = '<div>';
                if(dataItem.parentid == null) {
                    buttons += '<button type="button" class="k-button k-button-icontext k-grid-add" onClick="add_child(' + dataItem.id + ')"><span class="k-icon k-i-plus"></span>Add</button>';
                } else {
                    buttons += '<button type="button" class="k-button k-button-icontext k-grid-add" onClick="add_child(' + dataItem.masterType + ')"><span class="k-icon k-i-plus"></span>Add</button>';
                }
                if(dataItem.Id > -1){
                    buttons += '<button type="button" class="k-button k-button-icontext k-grid-edit" onClick="edit_child(' + dataItem.id + ',\'' + dataItem.masterType + '\')"><span class="k-icon k-i-edit"></span>Edit</button>';
                }
                buttons += '</div>';
                return buttons;
            },
            width: 180 
        }],
        pageable: {
            pageSize: 15,
            pageSizes: true
        },
        drop: function(e) {
            if((e.position == 'over') || (e.source.parentid != e.destination.parentid)) {
                e.preventDefault();
            } else {
                $('#loader-wrap').removeClass('hide')
                var source_data = {
                    "Id":e.source.Id,
                    "Type": e.source.masterType,
                    "OrderId": e.destination.OrderId
                }
                var destination_data = {
                    "Id":e.destination.Id,
                    "Type": e.destination.masterType,
                    "OrderId": e.source.OrderId
                }
                getTokenRedirect(loginRequest).then(response => {
                    $.ajax({
                        url: 'https://emrsapi.azurewebsites.net/api/referenceData/items',
                        headers: {
                            'Content-Type': 'application/json',
                            "Authorization": "Bearer " + response.accessToken
                        },
                        type: 'PATCH',
                        data: JSON.stringify(source_data),
                        cache:false,
                        contentType: false,
                        processData: false,
                        success: function (data) {
                            $.ajax({
                                url: 'https://emrsapi.azurewebsites.net/api/referenceData/items',
                                headers: {
                                    'Content-Type': 'application/json',
                                    "Authorization": "Bearer " + response.accessToken
                                },
                                type: 'PATCH',
                                data: JSON.stringify(destination_data),
                                cache:false,
                                contentType: false,
                                processData: false,
                                success: function (data) {
                                    var first_order_id = e.source.OrderId;
                                    e.source.set("OrderId", e.destination.OrderId);
                                    e.destination.set("OrderId", first_order_id);
                                    var order_fixed = 0;
                                    for(i=0;i<referenceDatas.length;i++){
                                        if(referenceDatas[i].id == e.source.id) {
                                            referenceDatas[i].OrderId = e.source.OrderId;
                                            order_fixed++;
                                        }
                                        if(referenceDatas[i].id == e.destination.id) {
                                            referenceDatas[i].OrderId = e.destination.OrderId;
                                            order_fixed++;
                                        }
                                        if(order_fixed == 2) break;
                                    }
                                    e.sender.refresh();
                                    $('#loader-wrap').addClass('hide')
                                },
                                error: function (data) {
                                    $('#loader-wrap').addClass('hide')
                                    kendo.alert("Reordering is failed.");
                                }
                            })
                        },
                        error: function (data) {
                            $('#loader-wrap').addClass('hide')
                            kendo.alert("Reordering is failed.");
                        }
                    });
                }).catch(error => {
                    $('#loader-wrap').addClass('hide')
                    kendo.alert("You don’t have access to EMRS Reference Data, please contact the Administrator.");
                })
            }
        }
    });

    let treeList = $("#treelist").data("kendoTreeList");
    let rows = $("tr.k-treelist-group", treeList.tbody);

    $('.k-input').on('keydown input', function(event){
        if($(this).val() != '') {
            $.each(rows, function(idx, row) {
                treeList.expand(row);
            });
        } else {
            $.each(rows, function(idx, row) {
                treeList.collapse(row);
            });
        }
    })
}

//================== MSAL Auth Block End =============

let ref_edit_data = '', ref_editting = false;

$.getJSON( "assets/js/field_order.json").then(function( data ) {
    field_order = data
});

function masterTypeChange(e){
    let dataItem = this.dataItem(e.item);
    var masterName = dataItem.name.replace(/\s/g, '').toLowerCase()
    getTokenRedirect(loginRequest).then(response => {
        fetch(' https://emrsapi.azurewebsites.net/api/graphql', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            "Authorization": "Bearer " + response.accessToken
          },
          body: JSON.stringify({query:'{__type(name:"' + masterName + '") {fields{name,description,type{name}}}}'})
        })
        .then(response => response.json())
        .then(data => {
            $("#reference-modal-content").empty()
            $("#parent-type-wrap").empty()
            checkFieldExist(data.data.__type.fields)
            for(let i=0;i<urls.length;i++){
                if(urls[i].id == dataItem.id) {
                    if(urls[i].parentid != null) {
                        $("#parent-type-wrap").append($('<div />').addClass('k-edit-label').append($('<label />').text('Parent Type')))
                            .append($('<div />').addClass('k-edit-field').append($('<input>').attr('type', 'text').attr('id', 'parent-type')))
                        for(let j=0;j<urls.length;j++){
                            if(urls[j].id == urls[i].parentid){
                                getTokenRedirect(loginRequest).then(response => {
                                    fetch('https://emrsapi.azurewebsites.net/api/referenceData/items/' + urls[j].name, {
                                      method: 'GET',
                                      headers: {
                                        'Content-Type': 'application/json',
                                        "Authorization": "Bearer " + response.accessToken
                                      },
                                    })
                                    .then(response => response.json())
                                    .then(data => {
                                        $("#parent-type").kendoDropDownList({
                                            optionLabel: "Select",
                                            dataTextField: "Name",
                                            dataValueField: "Id",
                                            dataSource: data.value
                                        });
                                        if(ref_editting) {
                                            let parentDropdownList = $("#parent-type").data("kendoDropDownList");
                                            parentDropdownList.value(ref_edit_data[urls[j].name + 'Id']);
                                            parentDropdownList.trigger("change");
                                        }
                                    })
                                })
                                $("#parent-type-wrap").append($('<input>').attr('type', 'hidden').val(urls[j].name).attr('id', 'parent-type-name'))
                                
                                break;
                            }
                        }
                    }
                    break;
                }
            }
        })
    }).catch(error => {
        $('#loader-wrap').addClass('hide')
        kendo.alert("You don’t have access to EMRS Reference Data, please contact the Administrator.");
    })
}

function checkFieldExist(fields) {
    field_order.map((field_detail) => {
        fields.some((field) => {
            if(field_detail.fieldname.toLowerCase() == field.name.toLowerCase()){
                generateReferenceFields(field.type.name, field_detail.text, field_detail.fieldname, field_detail.request)
                return true
            }
            return false
        })
    })
}

function generateReferenceFields(input_type, label_text, case_text, status){
    switch (input_type) {
        case 'String':
            if(ref_editting || status) {
                $("#reference-modal-content").append($('<div />').addClass('k-edit-label').append($('<label />').text(label_text)))
                    .append($('<div />').addClass('k-edit-field').append($('<input>').attr('type', 'text').attr('id', 'reference-'+case_text).addClass('k-textbox')))
                if(ref_editting) {
                    $('#reference-'+case_text).val(ref_edit_data[case_text])
                }
                if(!status) {
                    $('#reference-'+case_text).attr('readonly', true)
                }
            }
            break;
        case 'Int':
            if(ref_editting || status) {
                if(ref_editting || case_text != 'Id') {
                    $("#reference-modal-content").append($('<div />').addClass('k-edit-label').append($('<label />').text(label_text)))
                        .append($('<div />').addClass('k-edit-field').append($('<input>').attr('type', 'number').attr('id', 'reference-'+case_text).addClass('k-textbox')))
                    if(case_text == 'Id') $("#reference-Id").attr('readonly', true)
                    if(ref_editting) {
                        $('#reference-'+case_text).val(ref_edit_data[case_text])
                    }
                    if(!status) {
                        $('#reference-'+case_text).attr('readonly', true)
                    }
                }
            }
            break;
        case 'Boolean':
            if(ref_editting || status) {
                $("#reference-modal-content").append($('<div />').addClass('k-edit-label').append($('<label />').text(label_text)))
                    .append($('<div />').addClass('k-edit-field').append($('<input>').attr('type', 'checkbox').attr('id', 'reference-'+case_text).addClass('k-textbox')))
                if(ref_editting) {
                    $('#reference-'+case_text).attr('checked', ref_edit_data[case_text])
                }
                if(!status) {
                    $('#reference-'+case_text).attr('readonly', true)
                }
                $('#reference-'+case_text).kendoSwitch({
                    messages: {
                        checked: "YES",
                        unchecked: "NO"
                    }
                });
            }
            break;
        case 'DateTime':
            if(ref_editting || status) {
                $("#reference-modal-content").append($('<div />').addClass('k-edit-label').append($('<label />').text(label_text)))
                    .append($('<div />').addClass('k-edit-field').append($('<input>').attr('id', 'reference-'+case_text).addClass('k-textbox')))
                if(ref_editting) {
                    $('#reference-'+case_text).val(ref_edit_data[case_text])
                }
                if(!status) {
                    $('#reference-'+case_text).attr('readonly', true)
                }
                $('#reference-'+case_text).kendoDateTimePicker({
                    componentType: "modern"
                });
            }
            break;
    }
}



let reference_pop = $("#reference-pop").kendoWindow({
    dataSource: {
        type: "object"
    },
    content: {
        iframe: true
    },
    actions: ["Minimize", "Close"],
    draggable: true,
    resizable: false,
    width: "500px",
    modal: true,
    title: "Edit",
    visible: false,
    open: function(e) {
        $("#masterType").kendoDropDownList({
            optionLabel: "Select",
            dataTextField: "Name",
            dataValueField: "id",
            dataSource: urls,
            change: masterTypeChange
        });
    }
});

function add_child(masterType) {
    ref_editting = false
    viewModel = kendo.observable({"isNew":true});
    var kendoDialog = kendo.template($("#reference-popup-template").html());
    reference_pop.data("kendoWindow").content(kendoDialog(viewModel)).center().open()
    setTimeout(function(){
        let masterDropdownlist = $("#masterType").data("kendoDropDownList");
        masterDropdownlist.value(masterType);
        masterDropdownlist.trigger("change");
    }, 500)

    $('.add-ref-data-btn').on('click', function(){
        var ref_post_val = {}
        field_order.map((field_detail) => {
            if(field_detail.request) {
                var ref_modal_ele = $('#reference-' + field_detail.fieldname)
                if(ref_modal_ele.length > 0){
                    if(ref_modal_ele.attr('type') == 'checkbox') {
                        ref_post_val[field_detail.fieldname] = ref_modal_ele.get(0).checked
                    } else if(ref_modal_ele.attr('type') == 'number'){
                        if(ref_modal_ele.val() != '')
                            ref_post_val[field_detail.fieldname] = parseInt(ref_modal_ele.val())
                    } else {
                        if(ref_modal_ele.val() != '')
                            ref_post_val[field_detail.fieldname] = ref_modal_ele.val()
                    }
                }
            }
        })
        if($('#parent-type').length > 0) {
            ref_post_val[$('#parent-type-name').val() + 'Id'] = parseInt($("#parent-type").data("kendoDropDownList").value());
        }
        ref_post_val.Type = parseInt($("#masterType").data("kendoDropDownList").value());
        getTokenRedirect(loginRequest).then(response => {
            $.ajax({
                url: 'https://emrsapi.azurewebsites.net/api/referenceData/items',
                headers: {
                    'Content-Type': 'application/json',
                    "Authorization": "Bearer " + response.accessToken
                },
                type: 'POST',
                data: JSON.stringify(ref_post_val),
                cache:false,
                contentType: false,
                processData: false,
                success: function (data) {
                    if(data.value) {
                        var newElement = data.value
                        var masterDetails;

                        for(var i=0;i<urls.length;i++){
                            if(urls[i].id == masterType){
                                masterDetails = urls[i];
                                break;
                            }
                        }

                        if(masterDetails.parentid == null) {
                            newElement.parentid = masterType
                        } else {
                            for(var i=0;i<urls.length;i++){
                                if(urls[i].id == masterDetails.parentid){
                                    newElement.parentid = urls[i].id * 10000 + parseInt($("#parent-type").data("kendoDropDownList").value())
                                    break;
                                }
                            }
                        }

                        newElement.id = masterDetails.id * 10000 + newElement.Id
                        newElement.masterType = masterDetails.id
                        
                        referenceDatas.push(newElement)
                        $("#treelist").data("kendoTreeList").dataSource.pushCreate(newElement);
                        reference_pop.data("kendoWindow").close()
                    } else {
                        $('.k-error-msg').text('')
                        var errors = data.error.message
                        for(var i=0;i<errors.length;i++){
                            $('.k-error-msg').text($('.k-error-msg').text() + errors[i])
                        }
                    }
                },
                error: function (data) {
                    $('.k-error-msg').text('')
                    var errors = data.responseJSON.error.message
                    for(var i=0;i<errors.length;i++){
                        $('.k-error-msg').html($('.k-error-msg').text() + '<br>' + errors[i])
                    }
                }
            });
        }).catch(error => {
            $('#loader-wrap').addClass('hide')
            kendo.alert("You don’t have access to EMRS Reference Data, please contact the Administrator.");
        })
    })

    $('.close-ref-data-btn').on('click', function(){
        reference_pop.data("kendoWindow").close()
    })
}

function edit_child(dataIndex, masterType){

    var ref_edit_num, updatedElement
    ref_editting = true;
    for(let i=0;i<referenceDatas.length;i++){
        if(referenceDatas[i].id == dataIndex){
            ref_edit_num = i
            updatedElement = referenceDatas[i]
            let row, grid, dataItem, viewModel, kendoDialog, key = 'edit'
            ref_edit_data = referenceDatas[i]
            viewModel = kendo.observable(referenceDatas[i]);
            kendoDialog = kendo.template($("#reference-popup-template").html());
            reference_pop.data("kendoWindow").content(kendoDialog(viewModel)).center().open()

            setTimeout(function(){
                let masterDropdownlist = $("#masterType").data("kendoDropDownList");
                masterDropdownlist.value(masterType);
                masterDropdownlist.trigger("change");
            }, 500)
        }
    }

    $('.edit-ref-data-btn').on('click', function(){
        var ref_post_val = {}
        field_order.map((field_detail) => {
            if(field_detail.request) {
                var ref_modal_ele = $('#reference-' + field_detail.fieldname)
                if(ref_modal_ele.length > 0){
                    if(ref_modal_ele.attr('type') == 'checkbox') {
                        ref_post_val[field_detail.fieldname] = ref_modal_ele.get(0).checked
                    } else if(ref_modal_ele.attr('type') == 'number'){
                        if(ref_modal_ele.val() != '')
                            ref_post_val[field_detail.fieldname] = parseInt(ref_modal_ele.val())
                    } else {
                        if(ref_modal_ele.val() != '')
                            ref_post_val[field_detail.fieldname] = ref_modal_ele.val()
                    }
                }
            }
        })
        if($('#parent-type').length > 0) {
            ref_post_val[$('#parent-type-name').val() + 'Id'] = parseInt($("#parent-type").data("kendoDropDownList").value());
        }
        ref_post_val.Type = parseInt($("#masterType").data("kendoDropDownList").value());
        getTokenRedirect(loginRequest).then(response => {
            $.ajax({
                url: 'https://emrsapi.azurewebsites.net/api/referenceData/items',
                headers: {
                    'Content-Type': 'application/json',
                    "Authorization": "Bearer " + response.accessToken
                },
                type: 'PATCH',
                data: JSON.stringify(ref_post_val),
                cache:false,
                contentType: false,
                processData: false,
                success: function (data) {
                    if(data.success) {
                        for(var key in ref_post_val) {
                            var value = ref_post_val[key];
                            updatedElement[key] = value
                        }
                        referenceDatas[ref_edit_num] = updatedElement
                        $("#treelist").data("kendoTreeList").dataSource.pushUpdate(updatedElement);
                        reference_pop.data("kendoWindow").close()
                    } else {
                        $('.k-error-msg').text('')
                        var errors = data.error.message
                        for(var i=0;i<errors.length;i++){
                            $('.k-error-msg').text($('.k-error-msg').text() + errors[i])
                        }
                    }
                },
                error: function (data) {
                    $('.k-error-msg').text('')
                    var errors = data.responseJSON.error.message
                    for(var i=0;i<errors.length;i++){
                        $('.k-error-msg').html($('.k-error-msg').text() + '<br>' + errors[i])
                    }
                }
            });
        }).catch(error => {
            $('#loader-wrap').addClass('hide')
            kendo.alert("You don’t have access to EMRS Reference Data, please contact the Administrator.");
        })
    })
    
    $('.close-ref-data-btn').on('click', function(){
        reference_pop.data("kendoWindow").close()
    })
}

function delete_if_condition(ele) {
    $(ele).parent().parent().remove()
}


function generateDocumentGrid(dPermission_data) {
    $("#document-permission").kendoGrid({
        dataSource: {
            data: dPermission_data,
            schema: {
                model: {
                    fields: {
                    }
                }
            },
            batch: true,
            pageSize: 20
        },
        toolbar: kendo.template($("#doc-toolbar-template").html()),
        height: 550,
        scrollable: true,
        sortable: true,
        filterable: true,
        pageable: {
            refresh: true,
            pageSizes: true,
            buttonCount: 5
        },
        columns: [
            { field: "name", title: "Name" },
            { title: "Document Metadata", template: $("#doc-metadata-template").html() },
            { title: "User Metadata", template: $("#user-metadata-template").html() },
            { title: "Access", template: $("#doc-access-template").html() },
            { title: "Status", template: $("#status-template").html() },
            {
                title: 'Actions',
                template: function (dataItem) {
                    let buttons = '<div>';
                    buttons += '<button class="k-button k-button-icontext doc-app-edt"><span class="k-icon k-i-edit"></span>Edit</button>';
                
                    buttons += '<a role="button" class="k-button k-button-icontext k-grid-delete" href="#"><span class="k-icon k-i-close"></span>Delete</a>';
                    
                    buttons += '</div>';
                    return buttons;
                },
                width: 200 
            }
        ],
        dataBound: function() {
            this.tbody.find(".statusClass").kendoSwitch({
                messages: {
                    checked: "ON",
                    unchecked: "OFF"
                }
            });
        }
    });
}

function generateSystemGrid(sPermission_data){
    $("#system-permission").kendoGrid({
        dataSource: {
            data: sPermission_data,
            schema: {
                model: {
                    fields: {
                        name: { field: "name", nullable: false },
                        description: { field: "description" },
                        ruledefination: {defaultValue: {
                            "ifCondition":[{
                                "userAttribute":{"id":0,"name":""},
                                "operator":{"id":0,"name":""},
                                "value":{"value":""}
                            }],
                            "thenCondition":[{
                                "permission":{"id":0,"name":""},
                                "value":{"id":0,"name":""}
                            }]
                        }},
                        application: {
                            "id": 0,
                            "name": ""
                        }
                    }
                }
            },
            batch: true,
            pageSize: 20
        },
        height: 550,
        scrollable: true,
        sortable: true,
        filterable: true,
        pageable: {
            refresh: true,
            pageSizes: true,
            buttonCount: 5
        },
        toolbar: kendo.template($("#toolbar-template").html()),
        columns: [
            { field: "name", title: "Name" },
            { title: "Condition(s)", template: $("#condition-template").html() },
            { title: "Permission", template: $("#permission-template").html() },
            { title: "Application", template: $("#application-template").html() },
            { title: "Status", template: $("#status-template").html() },
            {
                title: 'Actions',
                template: function (dataItem) {
                    let buttons = '<div>';
                    buttons += '<button class="k-button k-button-icontext sys-app-edt"><span class="k-icon k-i-edit"></span>Edit</button>';
                
                    buttons += '<a role="button" class="k-button k-button-icontext k-grid-delete" href="#"><span class="k-icon k-i-close"></span>Delete</a>';
                    
                    buttons += '</div>';
                    return buttons;
                },
                width: 200 
            }
        ],
        dataBound: function() {
            this.tbody.find(".statusClass").kendoSwitch({
                messages: {
                    checked: "ON",
                    unchecked: "OFF"
                }
            });
        }
    });
}


function add_sys_clause(){
    let condition_wrap = $('#ifCondition-wrap')
    condition_wrap.append($('<div />').attr('class', 'full-flex flex-center d-flex')
        .append($('<input />').addClass('ifCondition'))
        .append($('<input />').addClass('ifOperator'))
        .append($('<input />').addClass('ifCountry').attr('disabled', 'disabled'))
        .append($('<span />').addClass('text-right').append($('<i />').attr('class', 'k-icon k-i-trash if-delete').attr('onClick', 'delete_if_condition(this)')))
    )
    let last_flex = $('#ifCondition-wrap>.full-flex');
    let ifCondition = $(last_flex[last_flex.length - 1]).find('.ifCondition')
    let ifOperator = $(last_flex[last_flex.length - 1]).find('.ifOperator')
    let ifCountry = $(last_flex[last_flex.length - 1]).find('.ifCountry')
    ifCondition.kendoDropDownList({
        optionLabel: "Select",
        dataTextField: "name",
        dataValueField: "id",
        dataSource: sysPermissionDatas.userattributes,
        change: ifCondition_change
    })
    ifOperator.kendoDropDownList({
        optionLabel: "Select",
        dataTextField: "name",
        dataValueField: "id",
        dataSource: sysPermissionDatas.operators
    })
    ifCountry.kendoDropDownList({
        autoBind: false,
        optionLabel: "Select",
        dataTextField: "name",
        dataValueField: "id"
    })
    $("#sys-pop").data("kendoWindow").center()
}

function get_sys_ifcondition_names(first_slt, operator, second_slt){
    var res = {
        "first_slt": '',
        "operator": '',
        "second_slt": ''
    };
    for(var i=0;i<sysPermissionDatas.userattributes.length;i++){
        if(sysPermissionDatas.userattributes[i].id == first_slt) {
            res.first_slt = sysPermissionDatas.userattributes[i].name
            break;
        }
    }
    for(var i=0; i<sysPermissionDatas.operators.length;i++){
        if(sysPermissionDatas.operators[i].id == operator) {
            res.operator = sysPermissionDatas.operators[i].name
            break;
        }
    }
    for(var i=0;i<sysPermissionDatas.attributeoperatormappings.length;i++){
        if(first_slt == sysPermissionDatas.attributeoperatormappings[i].attributeid) {
            if(sysPermissionDatas.attributeoperatormappings[i].valuetype == 'freetext') {
                res.second_slt = second_slt;
            } else {
                var attr_key = sysPermissionDatas.attributeoperatormappings[i].value.toLowerCase() + 's';
                if(sysPermissionDatas[attr_key] != undefined) {
                    for(var j=0;j<sysPermissionDatas[attr_key].length;j++) {
                        if(sysPermissionDatas[attr_key][j].id == second_slt) {
                            res.second_slt = sysPermissionDatas[attr_key][j].name
                        }
                    }
                } else {
                    res.second_slt = ''
                }
            }
            break;
        }
    }
    return res;
}

function get_sys_thencondition_names(permission, value){
    var res = {
        "permission": "",
        "value": ""
    }
    for(var i=0;i<sysPermissionDatas.userpermissionatrributes.length;i++){
        if(permission == sysPermissionDatas.userpermissionatrributes[i].id){
            res.permission = sysPermissionDatas.userpermissionatrributes[i].name;
            break;
        }
    }
    var sPermission_data;
    if(permission == 1) {
        sPermission_data = sysPermissionDatas.permissionaccesstypes
    } else if((permission == 4) || (permission == 5)) {
        sPermission_data = sysPermissionDatas.systempositions
    } else if(permission == 3) {
        sPermission_data = sysPermissionDatas.systemroles
    }
    for(var i=0;i<sPermission_data.length;i++){
        if(sPermission_data[i].id == value) {
            res.value = sPermission_data[i].name;
            break;
        }
    }
    return res;
}

var documentPermissionDatas, documentPermissionTabOpen = true, sysPermissionDatas, sysPermissionTabOpen = true;
const doc_fetch_body = "{permissionaccesstypes{id,displayname}" +
        "mastertypes{id,parentid,name,displayname,metadataflag,documentmetadataflag}" +
        "countrys{id,name,regionid}" +
        "syndromes{id,name}" +
        "sourceofinformations{id,name}" +
        "regions{id,name}" +
        "languages{id,name}" +
        "hazards{id,name}" +
        "documenttypes{id,name,documentcategoryid,documentroleid}" +
        "documentcategorys{id,name}" +
        "diseaseconds{id,name,hazardid}" +
        "aetiologys{id,name}" +
        "agencys{id,agencyname}" +
        "sensitiveinfos{id,name}" +
        "roles{id,name}" +
        "internalexternals{id,name}" +
        "assignmentfunction{id,name}" +
        "documentroles{id,name,assignmentfunctionid}" +
        "occurrences{id,occurrencename}" +
        "groups{groupid,groupname}" +
        "locations{id,name}}"

const sys_fetch_body = '{userpermissions(sortBy:{field:"name",direction:"asc"}){name,description,application{id, name},ruledefination}' +
        'userattributes(sortBy:{field:"name",direction:"asc"}){id,name,displayname}' +
        'userpermissionatrributes(sortBy:{field:"name",direction:"asc"}){id,name}' +
        'operators(sortBy:{field:"name",direction:"asc"}){id,name}' +
        'attributeoperatormappings{id,attributeid,operatorid,valuetype,value}' +
        'internalexternals(sortBy:[{field:"orderid",direction:"asc"},{field:"name",direction:"asc"}]){id,name}' +
        'countrys(sortBy:[{field:"orderid",direction:"asc"},{field:"name",direction:"asc"}]){id,name}' +
        'regions(sortBy:[{field:"orderid",direction:"asc"},{field:"name",direction:"asc"}]){id,name}' +
        'locationtypes(sortBy:[{field:"orderid",direction:"asc"},{field:"name",direction:"asc"}]){id,name}' +
        'assignmentroles(sortBy:[{field:"orderid",direction:"asc"},{field:"name",direction:"asc"}]){id,name}' +
        'assignmentfunctions(sortBy:[{field:"orderid",direction:"asc"},{field:"name",direction:"asc"}]){id,name}' +
        'systempositions(sortBy:{field:"name",direction:"asc"}){id,name}' +
        'systemroles(sortBy:{field:"name",direction:"asc"}){id,name}' +
        'applications(sortBy:{field:"name",direction:"asc"}){id,name}' +
        'permissionaccesstypes{id,name}}'

$(document).ready(function() {

    $("#tabstrip").kendoTabStrip({
        animation:  {
            open: {
                effects: "fadeIn"
            }
        }
    });

    $('#tabstrip-tab-3').on('click', () => {
        if(documentPermissionTabOpen) {
            $('#loader-wrap').removeClass('hide')
            getTokenRedirect(loginRequest).then(response => {
                fetch(' https://emrsapi.azurewebsites.net/api/graphql', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    "Authorization": "Bearer " + response.accessToken
                  },
                  body: JSON.stringify({query:doc_fetch_body})
                })
                .then(response => response.json())
                .then(data => {
                    documentPermissionDatas = data.data
                    for(var i=0;i<documentPermissionDatas.mastertypes.length;i++) {
                        if(documentPermissionDatas.mastertypes[i].documentmetadataflag == 1) {
                            dDocumentMetaData.push(documentPermissionDatas.mastertypes[i])
                        }
                        if(documentPermissionDatas.mastertypes[i].metadataflag == 2) {
                            dUserMetaData.push(documentPermissionDatas.mastertypes[i])
                        }
                    }
                    for(var i=0;i<dDocumentMetaData.length;i++) {
                        dDocumentMetaData[i].childIndices = new Array;
                        for(var j=0;j<documentPermissionDatas.mastertypes.length;j++) {
                            if((dDocumentMetaData[i].id == documentPermissionDatas.mastertypes[j].parentid) && (documentPermissionDatas.mastertypes[j].documentmetadataflag == 1)) {
                                dDocumentMetaData[i].childIndices.push(j)
                            }
                        }
                    }
                }).catch((error) => {
                    console.log(error)
                });
                
            }).catch(error => {
                $('#loader-wrap').addClass('hide')
                kendo.alert("You don’t have access to EMRS Reference Data, please contact the Administrator.");
            });



            getTokenRedirect(loginRequest).then(response => {
                fetch('https://emrsapi.azurewebsites.net/api/permissions/rules/' + 'document', {
                  method: 'GET',
                  headers: {
                    'Content-Type': 'application/json',
                    "Authorization": "Bearer " + response.accessToken
                  },
                })
                // fetch('document_permissions_20210525.json', {
                //   method: 'GET',
                //   headers: {
                //     'Content-Type': 'application/json'
                //   },
                // })
                .then(response => response.json())
                .then(data => {
                    dPermission_data = data.value
                    generateDocumentGrid(dPermission_data)
                    $('#loader-wrap').addClass('hide')
                    documentPermissionTabOpen = false
                })
                .catch((error) => {
                    console.log(error)
                });
                
            }).catch(error => {
                $('#loader-wrap').addClass('hide')
                kendo.alert("You don’t have access to EMRS Reference Data, please contact the Administrator.");
            });
        }
    })

    $('#tabstrip-tab-2').on('click', () => {
        if(sysPermissionTabOpen) {
            $('#loader-wrap').removeClass('hide')
            getTokenRedirect(loginRequest).then(response => {
                fetch(' https://emrsapi.azurewebsites.net/api/graphql', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    "Authorization": "Bearer " + response.accessToken
                  },
                  body: JSON.stringify({query:sys_fetch_body})
                })
                // fetch('user_permissions_20210525.json', {
                //   method: 'GET',
                //   headers: {
                //     'Content-Type': 'application/json'
                //   }
                // })
                .then(response => response.json())
                .then(data => {
                    sysPermissionDatas = data.data
                    for(var i=0;i<sysPermissionDatas.userpermissions.length;i++) {
                        sysPermissionDatas.userpermissions[i].ruledefination = JSON.parse(sysPermissionDatas.userpermissions[i].ruledefination)
                        if(i == (sysPermissionDatas.userpermissions.length - 1)) {
                            
                            sCondition = sysPermissionDatas.userattributes
                            sOperator = sysPermissionDatas.operators
                            sysPermissionDatas.userpermissions.map((userpermission, index) => {
                                if(userpermission.ruledefination.IfCondition != undefined) {
                                    sysPermissionDatas.userpermissions[index].ruledefination.ifCondition = new Array();
                                    userpermission.ruledefination.IfCondition.map((ifCondition) => {
                                        var temp_ifCondition = {};
                                        temp_ifCondition.userAttribute = {}
                                        temp_ifCondition.userAttribute.id = ifCondition.UserAttribute
                                        temp_ifCondition.userAttribute.name = ''
                                        temp_ifCondition.operator = {}
                                        temp_ifCondition.operator.id = ifCondition.Operator
                                        temp_ifCondition.operator.name = ''
                                        temp_ifCondition.value = {}
                                        temp_ifCondition.value.id = ifCondition.Value
                                        temp_ifCondition.value.name = ''
                                        var temp_names = get_sys_ifcondition_names(ifCondition.UserAttribute, ifCondition.Operator, ifCondition.Value)
                                        temp_ifCondition.userAttribute.name = temp_names.first_slt;
                                        temp_ifCondition.operator.name = temp_names.operator;
                                        temp_ifCondition.value.name = temp_names.second_slt;
                                        temp_ifCondition.value.value = temp_names.second_slt;
                                        sysPermissionDatas.userpermissions[index].ruledefination.ifCondition.push(temp_ifCondition)
                                    })
                                }
                                if(userpermission.ruledefination.ThenCondition != undefined) {
                                    sysPermissionDatas.userpermissions[index].ruledefination.thenCondition = new Array();
                                    var temp_thenCondition = {};
                                    temp_thenCondition.permission = {}
                                    temp_thenCondition.permission.id = userpermission.ruledefination.ThenCondition.Permission
                                    temp_thenCondition.permission.name = ''
                                    temp_thenCondition.value = {}
                                    temp_thenCondition.value.id = userpermission.ruledefination.ThenCondition.Value
                                    temp_thenCondition.value.name = ''
                                    var temp_names = get_sys_thencondition_names(temp_thenCondition.permission.id, temp_thenCondition.value.id)
                                    temp_thenCondition.permission.name = temp_names.permission;
                                    temp_thenCondition.value.name = temp_names.value;
                                    sysPermissionDatas.userpermissions[index].ruledefination.thenCondition.push(temp_thenCondition)
                                }
                                if(index == (sysPermissionDatas.userpermissions.length - 1)) {
                                    sPermission_data = sysPermissionDatas.userpermissions
                                    generateSystemGrid(sPermission_data)
                                }
                            })
                            
                            $('#loader-wrap').addClass('hide')
                            sysPermissionTabOpen = false
                        }
                    }
                }).catch((error) => {
                    console.log(error)
                });
                
            }).catch(error => {
                $('#loader-wrap').addClass('hide')
                kendo.alert("You don’t have access to EMRS Reference Data, please contact the Administrator.");
            });
        }
    })
    //===================================  TreeList(ReferenceData) block End.  ==============================================================================

    //=====================================  System Permission Block Start  =================================================================================

    let sPermission_data = new Array();
    let sCondition = new Array();
    let sOperator = new Array();
    let sCountry = new Array();

    

    let sys_pop = $("#sys-pop").kendoWindow({
        dataSource: {
            type: "object"
        },
        content: {
            iframe: true
        },
        actions: ["Custom", "Minimize", "Close"],
        draggable: true,
        resizable: false,
        width: "500px",
        modal: true,
        title: "Edit",
        visible: false,
        open: function(e) {
            

        }
    });

    $("#system-permission").on("click", ".sys-app-edt, .sys-permission-add", function(e){
        e.preventDefault();
        let row, grid, dataItem, viewModel, kendoDialog, key = 'edit'
        if($(e.target).hasClass('sys-permission-add')){
            viewModel = kendo.observable({"isNew":true});
            key = 'add'
            kendoDialog = kendo.template($("#sys-permission-popup-template").html());
            sys_pop.data("kendoWindow").title('Add').content(kendoDialog(viewModel)).center().open()
            setTimeout(() => {
                $("#status").kendoSwitch();
                $(".ifCondition").kendoDropDownList({
                    optionLabel: "Select",
                    dataTextField: "name",
                    dataValueField: "id",
                    dataSource: sCondition,
                    change: ifCondition_change
                });
                $(".ifOperator").kendoDropDownList({
                    optionLabel: "Select",
                    dataTextField: "name",
                    dataValueField: "id",
                    dataSource: sOperator
                });
                $(".ifCountry").addClass('k-textbox')

                $('#add-if-condition').on('click', add_sys_clause)

                sPermission = $("#sPermission").kendoDropDownList({
                    optionLabel: "Select",
                    dataTextField: "name",
                    dataValueField: "id",
                    dataSource: sysPermissionDatas.userpermissionatrributes,
                    change: sPermission_change
                });

                sPermissionResult = $("#sPermissionResult").kendoDropDownList({
                    optionLabel: "Select",
                    dataTextField: "name",
                    dataValueField: "id"
                });
            }, 200)
        } else {
            row = $(this).closest("tr");
            grid = $("#system-permission").data("kendoGrid");
            dataItem = grid.dataItem(row);
            var page_num = grid.dataSource.pageSize() * (grid.dataSource.page() - 1) + row.index()
            var sys_pop_edit_dataSource = sysPermissionDatas.userpermissions[page_num]
            viewModel = kendo.observable(sys_pop_edit_dataSource);
            kendoDialog = kendo.template($("#sys-permission-popup-template").html());
            sys_pop.data("kendoWindow").content(kendoDialog(viewModel)).center().open()
            setTimeout(() => {
                $("#status").kendoSwitch();
                var first_slt_id = sys_pop_edit_dataSource.ruledefination.ifCondition[0].userAttribute.id;
                $(".ifCondition").kendoDropDownList({
                    optionLabel: "Select",
                    dataTextField: "name",
                    dataValueField: "id",
                    dataSource: sCondition,
                    change: ifCondition_change,
                    value: first_slt_id
                });
                var second_slt_type = 'freetext', second_slt_key = '';
                for(var i=0;i<sysPermissionDatas.attributeoperatormappings.length;i++){
                    if(sysPermissionDatas.attributeoperatormappings[i].attributeid == first_slt_id) {
                        second_slt_type = sysPermissionDatas.attributeoperatormappings[i].valuetype
                        if(second_slt_type != 'freetext') {
                            second_slt_key = sysPermissionDatas.attributeoperatormappings[i].value.toLowerCase() + 's'
                        }
                        break;
                    }
                }
                $(".ifOperator").kendoDropDownList({
                    optionLabel: "Select",
                    dataTextField: "name",
                    dataValueField: "id",
                    dataSource: sOperator,
                    value: sys_pop_edit_dataSource.ruledefination.ifCondition[0].operator.id
                });
                $(".ifCountry").get(0).disabled = false
                if(second_slt_type != 'freetext') {
                    condition_results = $(".ifCountry").kendoDropDownList({
                        autoBind: false,
                        optionLabel: "Select",
                        dataTextField: "name",
                        dataValueField: "id",
                        dataSource: sysPermissionDatas[second_slt_key],
                        value: sys_pop_edit_dataSource.ruledefination.ifCondition[0].value.id
                    });
                } else {
                    $(".ifCountry").addClass('k-textbox').val(sys_pop_edit_dataSource.ruledefination.ifCondition[0].value.value)
                }


                for(var i=1;i<sys_pop_edit_dataSource.ruledefination.ifCondition.length;i++) {
                    first_slt_id = sys_pop_edit_dataSource.ruledefination.ifCondition[i].userAttribute.id;
                    let condition_wrap = $('#ifCondition-wrap')
                    condition_wrap.append($('<div />').attr('class', 'full-flex flex-center d-flex')
                        .append($('<input />').addClass('ifCondition'))
                        .append($('<input />').addClass('ifOperator'))
                        .append($('<input />').addClass('ifCountry').attr('disabled', 'disabled'))
                        .append($('<span />').addClass('text-right').append($('<i />').attr('class', 'k-icon k-i-trash if-delete').attr('onClick', 'delete_if_condition(this)')))
                    )
                    let last_flex = $('#ifCondition-wrap>.full-flex');
                    let ifCondition = $(last_flex[last_flex.length - 1]).find('.ifCondition')
                    let ifOperator = $(last_flex[last_flex.length - 1]).find('.ifOperator')
                    let ifCountry = $(last_flex[last_flex.length - 1]).find('.ifCountry')
                    ifCondition.kendoDropDownList({
                        optionLabel: "Select",
                        dataTextField: "name",
                        dataValueField: "id",
                        dataSource: sCondition,
                        change: ifCondition_change,
                        value: sys_pop_edit_dataSource.ruledefination.ifCondition[i].userAttribute.id
                    });
                    second_slt_type = 'freetext', second_slt_key = '';
                    for(var j=0;j<sysPermissionDatas.attributeoperatormappings.length;j++){
                        if(sysPermissionDatas.attributeoperatormappings[j].attributeid == first_slt_id) {
                            second_slt_type = sysPermissionDatas.attributeoperatormappings[j].valuetype
                            if(second_slt_type != 'freetext') {
                                second_slt_key = sysPermissionDatas.attributeoperatormappings[j].value.toLowerCase() + 's'
                            }
                            break;
                        }
                    }
                    ifOperator.kendoDropDownList({
                        optionLabel: "Select",
                        dataTextField: "name",
                        dataValueField: "id",
                        dataSource: sOperator,
                        value: sys_pop_edit_dataSource.ruledefination.ifCondition[i].operator.id
                    });
                    ifCountry.get(0).disabled = false
                    if(second_slt_type != 'freetext') {
                        condition_results = ifCountry.kendoDropDownList({
                            autoBind: false,
                            optionLabel: "Select",
                            dataTextField: "name",
                            dataValueField: "id",
                            dataSource: sysPermissionDatas[second_slt_key],
                            value: sys_pop_edit_dataSource.ruledefination.ifCondition[i].value.id
                        });
                    } else {
                        ifCountry.addClass('k-textbox').val(sys_pop_edit_dataSource.ruledefination.ifCondition[i].value.value)
                    }
                }

                $('#add-if-condition').on('click', add_sys_clause)


                var sys_permission_edit_id = sys_pop_edit_dataSource.ruledefination.thenCondition[0].permission.id

                var sPermission = $("#sPermission").kendoDropDownList({
                    optionLabel: "Select",
                    dataTextField: "name",
                    dataValueField: "id",
                    dataSource: sysPermissionDatas.userpermissionatrributes,
                    change: sPermission_change,
                    value: sys_permission_edit_id
                });

                $("#sPermissionResult").kendoDropDownList({
                    optionLabel: "Select",
                    dataTextField: "name",
                    dataValueField: "id"
                });

                var sPermissionResult = $("#sPermissionResult").data("kendoDropDownList")

                var sPop_permission_data;
                if(sys_permission_edit_id == 1) {
                    sPermissionResult.enable(true)
                    sPop_permission_data = sysPermissionDatas.permissionaccesstypes
                } else if((sys_permission_edit_id == 4) || (sys_permission_edit_id == 5)) {
                    sPermissionResult.enable(true)
                    sPop_permission_data = sysPermissionDatas.systempositions
                } else if(sys_permission_edit_id == 3) {
                    sPermissionResult.enable(true)
                    sPop_permission_data = sysPermissionDatas.systemroles
                }

                let dataSource = new kendo.data.DataSource({data: sPop_permission_data});
                sPermissionResult.setDataSource(dataSource);
                sPermissionResult.value(sys_pop_edit_dataSource.ruledefination.thenCondition[0].value.id);
                sPermissionResult.trigger("change");




            }, 200)
        }



        $('.edit-sys-permission').on('click', function(e){
            let edited_sys_permission = {}
            edited_sys_permission.name = $('#name').val()
            edited_sys_permission.id = '0'
            edited_sys_permission.description = $('#description').val()
            if($("#app_EMS").get(0).checked){
                edited_sys_permission.application = {"id": 1, "name": "EMS"}
            } else {
                edited_sys_permission.application = {"id": 2, "name": "EMS2"}
            }
            edited_sys_permission.status = $('#status').get(0).checked
            edited_sys_permission.ruledefination = {}
            edited_sys_permission.ruledefination.ifCondition = new Array()
            let ifCondition_wrap_rows = $("#ifCondition-wrap>div")
            for(let i=0;i<ifCondition_wrap_rows.length;i++){
                let ifCondition_val = {}
                ifCondition_val.userAttribute = {}
                ifCondition_val.userAttribute.id = $(ifCondition_wrap_rows[i]).find('input.ifCondition').data("kendoDropDownList").value()
                ifCondition_val.userAttribute.name = $(ifCondition_wrap_rows[i]).find('input.ifCondition').data("kendoDropDownList").text()

                ifCondition_val.operator = {}
                ifCondition_val.operator.id = $(ifCondition_wrap_rows[i]).find('input.ifOperator').data("kendoDropDownList").value()
                ifCondition_val.operator.name = $(ifCondition_wrap_rows[i]).find('input.ifOperator').data("kendoDropDownList").text()

                ifCondition_val.value = {}
                ifCondition_val.value.id = $(ifCondition_wrap_rows[i]).find('input.ifCountry').data("kendoDropDownList").value()
                ifCondition_val.value.name = $(ifCondition_wrap_rows[i]).find('input.ifCountry').data("kendoDropDownList").text()
            
                edited_sys_permission.ruledefination.ifCondition.push(ifCondition_val)
            }

            edited_sys_permission.ruledefination.thenCondition = new Array()
            let thenCondition_val = {}
            thenCondition_val.permission = {
                "id":$("#sPermission").data("kendoDropDownList").value(),
                "name":$("#sPermission").data("kendoDropDownList").text()
            }
            thenCondition_val.value = {
                "id":$("#sPermissionResult").data("kendoDropDownList").value(),
                "name":$("#sPermissionResult").data("kendoDropDownList").text()
            }

            edited_sys_permission.ruledefination.thenCondition.push(thenCondition_val)

            if(key == 'edit') {
                sPermission_data[row.index()] = edited_sys_permission
            } else {
                sPermission_data.unshift(edited_sys_permission)
            }
            

            $("#system-permission").data("kendoGrid").dataSource.read();

            sys_pop.data("kendoWindow").close()
        })
        $('.close-sys-permission').on('click', function(e){
            sys_pop.data("kendoWindow").close()
        })
    });


    


    //=======================  System Permission Block End  ==================================================================================

    //======================  Document Permission Block Start ================================================================================

    let dPermission_data = new Array();
    let dDocumentMetaData = new Array();
    let dUserMetaData = new Array();



    let doc_pop = $("#doc-pop").kendoWindow({
        dataSource: {
            type: "object"
        },
        content: {
            iframe: true
        },
        actions: ["Minimize", "Close"],
        draggable: true,
        resizable: false,
        width: "600px",
        modal: true,
        title: "Edit",
        visible: false,
        open: function(e) {
        }
    });

    $("#document-permission").on("click", ".doc-app-edt, .doc-permission-add", function(e){
        e.preventDefault();
        let row, grid, dataItem, viewModel, kendoDialog, key = 'edit'
        if($(e.target).hasClass('doc-permission-add')){
            viewModel = kendo.observable({"isNew":true});
            key = 'add'
            kendoDialog = kendo.template($("#doc-permission-popup-template").html());
            doc_pop.data("kendoWindow").title('Add').content(kendoDialog(viewModel)).center().open()
            setTimeout(() => {
                $("#active_status").kendoSwitch();
                let doc_meta_data = $("#doc_meta_data").kendoMultiSelect({
                    autoClose: false,
                    dataTextField: "displayname",
                    dataValueField: "id",
                    dataSource: dDocumentMetaData,
                    select: select_doc_meta_data,
                    deselect: deselect_doc_meta_data
                }).data("kendoMultiSelect");
                let user_meta_data = $("#user_meta_data").kendoMultiSelect({
                    autoClose: false,
                    dataTextField: "displayname",
                    dataValueField: "id",
                    dataSource: dUserMetaData,
                    select: select_user_meta_data,
                    deselect: deselect_user_meta_data
                }).data("kendoMultiSelect");
            }, 200)
        } else {
            row = $(this).closest("tr");
            grid = $("#document-permission").data("kendoGrid");
            dataItem = grid.dataItem(row);
            viewModel = kendo.observable(dPermission_data[row.index()]);
            kendoDialog = kendo.template($("#doc-permission-popup-template").html());
            doc_pop.data("kendoWindow").title('Edit').content(kendoDialog(viewModel)).center().open()
            setTimeout(() => {

                var page_num = grid.dataSource.pageSize() * (grid.dataSource.page() - 1) + row.index()
                let data = dPermission_data[page_num];

                let doc_meta_wrap = $('#doc-metadata-wrap')

                var documentMetaData
                var docMetaDataDefalult = new Array;

                if(data.ruleDefination.DocumentMetadata != undefined) {
                    documentMetaData = data.ruleDefination.DocumentMetadata
                } else {
                    documentMetaData = data.ruleDefination.documentMetadata
                }

                for(var i=0;i<documentMetaData.length;i++){
                    docMetaDataDefalult.push(documentMetaData[i].id)
                }

                var userMetaData
                var userMetaDataDefalult = new Array;

                if(data.ruleDefination.UserMetadata != undefined) {
                    userMetaData = data.ruleDefination.UserMetadata
                } else {
                    userMetaData = data.ruleDefination.userMetadata
                }

                for(var i=0;i<userMetaData.length;i++){
                    userMetaDataDefalult.push(userMetaData[i].id)
                }

                $("#active_status").kendoSwitch();
                let doc_meta_data = $("#doc_meta_data").kendoMultiSelect({
                    autoClose: false,
                    dataTextField: "displayname",
                    dataValueField: "id",
                    dataSource: dDocumentMetaData,
                    select: select_doc_meta_data,
                    deselect: deselect_doc_meta_data,
                    value: docMetaDataDefalult
                }).data("kendoMultiSelect");
                let user_meta_data = $("#user_meta_data").kendoMultiSelect({
                    autoClose: false,
                    dataTextField: "displayname",
                    dataValueField: "id",
                    dataSource: dUserMetaData,
                    select: select_user_meta_data,
                    deselect: deselect_user_meta_data,
                    value: userMetaDataDefalult
                }).data("kendoMultiSelect");
                for(var i=0;i<documentMetaData.length;i++) {
                    var key = documentMetaData[i].itemName
                    if(data.ruleDefination[key] == undefined) {
                        key = key.charAt(0).toLowerCase() + key.slice(1)
                    }
                    var edit_default_value = new Array;
                    var doc_id = documentMetaData[i].id
                    var child_edit_default_value = new Array;
                    for(var j=0;j<data.ruleDefination[key].length;j++) {
                        edit_default_value.push(data.ruleDefination[key][j].id)
                    }
                    var temp_data = {}
                    temp_data.dataItem = {}
                    temp_data.dataItem.id = documentMetaData[i].id
                    temp_data.dataItem.name = documentMetaData[i].itemName
                    temp_data.dataItem.displayname = documentMetaData[i].itemName.replace(/([A-Z])/g, ' $1').trim()
                    temp_data.dataItem.edit_default_value = edit_default_value
                    select_doc_meta_data(temp_data)
                }
                for(var i=0;i<userMetaData.length;i++) {
                    var key = userMetaData[i].itemName
                    if(data.ruleDefination[key] == undefined) {
                        key = key.charAt(0).toLowerCase() + key.slice(1)
                    }
                    var edit_default_value = new Array;
                    if(typeof(data.ruleDefination[key]) == 'Array') {
                        for(var j=0;j<data.ruleDefination[key].length;j++) {
                            edit_default_value.push(data.ruleDefination[key][j].id)
                        }
                    } else {
                        edit_default_value = data.ruleDefination[key]
                    }
                    var temp_data = {}
                    temp_data.dataItem = {}
                    temp_data.dataItem.id = userMetaData[i].id
                    temp_data.dataItem.name = userMetaData[i].itemName
                    temp_data.dataItem.displayname = userMetaData[i].itemName.replace(/([A-Z])/g, ' $1').trim()
                    temp_data.dataItem.edit_default_value = edit_default_value
                    select_user_meta_data(temp_data)
                }
            }, 500)
        }
        
        
    
        $('.edit-doc-permission').on('click', function(e){
            let edited_doc_permission = {}
            edited_doc_permission.type = "document"
            if(key == 'edit') {
                edited_doc_permission.Id = $('#doc-hidden-id').val()
            }
            edited_doc_permission.Name = $('#doc_name').val()
            edited_doc_permission.PermissionDescription = $('#doc_description').val()
            edited_doc_permission.GrantType = $('input[name=doc_permission]:checked').val()
            edited_doc_permission.Status = $('#active_status').get(0).checked
            edited_doc_permission.RuleDefination = {}
            edited_doc_permission.RuleDefination.DocumentMetadata = new Array();
            let document_metadatas = $("#doc_meta_data").data("kendoMultiSelect").dataItems()
            for(let i=0;i<document_metadatas.length;i++){
                edited_doc_permission.RuleDefination.DocumentMetadata.push({
                    "id": document_metadatas[i].id,
                    "itemName": document_metadatas[i].name
                })
            }

            let document_metadata_items = $("#doc-metadata-wrap select")

            for(let i=0;i<document_metadata_items.length;i++){
                let document_metadata_values = $(document_metadata_items[i]).data("kendoMultiSelect").dataItems()
                let key = $(document_metadata_items[i]).attr('dataName')

                edited_doc_permission.RuleDefination[key] = new Array();
                for(let j=0;j<document_metadata_values.length;j++){
                    edited_doc_permission.RuleDefination[key].push({
                        "id": document_metadata_values[j].id,
                        "itemName": document_metadata_values[j].name
                    })
                }
            }

            edited_doc_permission.RuleDefination.UserMetadata = new Array();
            let user_metadatas = $("#user_meta_data").data("kendoMultiSelect").dataItems()
            for(let i=0;i<user_metadatas.length;i++){
                edited_doc_permission.RuleDefination.UserMetadata.push({
                    "id": user_metadatas[i].id,
                    "itemName": user_metadatas[i].name
                })
            }

            document_metadata_items = $("#user-metadata-wrap select")

            for(let i=0;i<document_metadata_items.length;i++){
                let document_metadata_values = $(document_metadata_items[i]).data("kendoMultiSelect").dataItems()
                let key = $(document_metadata_items[i]).attr('dataName')

                edited_doc_permission.RuleDefination[key] = new Array();
                for(let j=0;j<document_metadata_values.length;j++){
                    edited_doc_permission.RuleDefination[key].push({
                        "id": document_metadata_values[j].id,
                        "itemName": document_metadata_values[j].name
                    })
                }
            }

            document_metadata_items = $("#user-metadata-wrap input")

            for(let i=0;i<document_metadata_items.length;i++){
                if($(document_metadata_items[i]).attr('dataName') != undefined) {
                    let document_metadata_values = $(document_metadata_items[i]).val()
                    let key = $(document_metadata_items[i]).attr('dataName')

                    edited_doc_permission.RuleDefination[key] = document_metadata_values
                }
            }


            if(key == 'edit') {
                getTokenRedirect(loginRequest).then(response => {
                    fetch(' https://emrsapi.azurewebsites.net/api/permissions/rules', {
                      method: 'PATCH',
                      headers: {
                        'Content-Type': 'application/json',
                        "Authorization": "Bearer " + response.accessToken
                      },
                      body: JSON.stringify(edited_doc_permission)
                    })
                    .then(response => response.json())
                    .then(data => {
                        if(data.error){
                            $('.k-error-msg').text('')
                            var errors = data.error.message
                            for(var i=0;i<errors.length;i++){
                                $('.k-error-msg').text($('.k-error-msg').text() + errors[i])
                            }
                        } else {
                            dPermission_data[row.index()].RuleDefination = edited_doc_permission.RuleDefination
                            dPermission_data[row.index()].id = edited_doc_permission.Id
                            dPermission_data[row.index()].grantType = edited_doc_permission.GrantType
                            dPermission_data[row.index()].permissionDescription = edited_doc_permission.PermissionDescription
                            dPermission_data[row.index()].status = edited_doc_permission.Status
                            $("#document-permission").data("kendoGrid").dataSource.read();

                            doc_pop.data("kendoWindow").close()
                        }
                    }).catch((error) => {
                        console.log(error)
                    });
                    
                }).catch(error => {
                    kendo.alert("You don’t have access to EMRS Reference Data, please contact the Administrator.");
                });
            } else {
                getTokenRedirect(loginRequest).then(response => {
                    fetch(' https://emrsapi.azurewebsites.net/api/permissions/rules', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                        "Authorization": "Bearer " + response.accessToken
                      },
                      body: JSON.stringify(edited_doc_permission)
                    })
                    .then(response => response.json())
                    .then(data => {
                        if(data.error){
                            $('.k-error-msg').text('')
                            var errors = data.error.message
                            for(var i=0;i<errors.length;i++){
                                $('.k-error-msg').text($('.k-error-msg').text() + errors[i])
                            }
                        } else {
                            dPermission_data.unshift(data)
                            $("#document-permission").data("kendoGrid").dataSource.read();

                            doc_pop.data("kendoWindow").close()
                        }
                    }).catch((error) => {
                        console.log(error)
                    });
                    
                }).catch(error => {
                    kendo.alert("You don’t have access to EMRS Reference Data, please contact the Administrator.");
                });
            }
            

            

        })
        $('.close-doc-permission').on('click', function(e){
            doc_pop.data("kendoWindow").close()
        })
    });

    $.getJSON( "simulate_json/applied_permissions.json").then(function( data ) {
        var simulate_json = data.data
        $("#applied-permission").kendoGrid({
            dataSource: {
                data: simulate_json,
                schema: {
                    model: {
                        fields: {
                        }
                    }
                },
                batch: true
            },
            columns: [
                { field: "Application", title: "Application" },
                { field: "Permission" },
                { field: "Value" },
                { field: "AppliedRule", title: "Applied Rule" }
            ]
        })
    })

    $.getJSON( "simulate_json/specific_user.json").then(function( data ) {

        var specific_user_ds = new kendo.data.DataSource({
            data: data.data.users
        });

        var categories = $("#spec-user-select").kendoComboBox({
            placeholder: "Begin typing and select",
            dataTextField: "firstname",
            dataSource: specific_user_ds,
            filter: "contains",
            suggest: true,
            template: '#=firstname# #=lastname# - #=emailaddress#',
            filtering: function (ev) {
                var filterValue = ev.filter != undefined ? ev.filter.value : ''
                ev.preventDefault();
                this.dataSource.filter({
                    logic: "or",
                    filters: [
                        {
                            field: "firstname",
                            operator: "contains",
                            value: filterValue
                        },
                        {
                            field: "lastname",
                            operator: "contains",
                            value: filterValue
                        },
                        {
                            field: "emailaddress",
                            operator: "contains",
                            value: filterValue
                        }
                    ]
                });
            }
        }).data("kendoComboBox");
        
    });

    var simul_path = './simulate_json/'
    var simul_dataSource = new kendo.data.DataSource({
        transport: {
            read: {
                dataType: "json",
                url: simul_path + "simulated_user.json"
            }
        },
        pageSize: 4,
        schema: {
            model: {
                fields: {
                    emailaddress: { type: "string" },
                    country: { type: "string" },
                    orgpath: { type: "string" },
                    groupmemberships: { type: "string" },
                    internalexternal: { type: "string" },
                    locationtype: { type: "string" },
                    region: { type: "string" }
                }
            }
        }
    });

    $("#simul-filter-wrap").kendoFilter({
        dataSource: simul_dataSource,
        applyButton: true,
        fields: [
            { name: "emailaddress", type: "string", label: "E-mail address" },
            { name: "country", type: "string", label: "Country" },
            { name: "orgpath", type: "string", label: "Org Path" },
            { name: "groupmemberships", type: "string", label: "Group Memberships" },
            { name: "internalexternal", type: "string", label: "Internal or external" },
            { name: "locationtype", type: "string", label: "Location Type" },
            { name: "region", type: "string", label: "Region" }
        ],
        expression: {
            logic: "and",
            filters: [
                { field: "emailaddress", value:"" , operator: "contains" },
                { field: "country", value: "", operator: "contains" }
            ]
        }
    }).data("kendoFilter").applyFilter();



        

});


function ifCondition_change(e){
    var first_select_id = this.value()
    var elmnt = document.createElement("input");
    elmnt.classList.add("ifCountry", "k-textbox");
    elmnt.setAttribute('placeholder', 'Select');
    var item = e.sender.element.get(0).parentElement.parentElement;
    var replace_num = 2
    if(item.childNodes.length > 4) {
        replace_num = 5;
    } else {
        replace_num = 2;
    }
    item.replaceChild(elmnt, item.childNodes[replace_num]);
    condition_results = $(e.sender.element).parent().parent().find('input.ifCountry')
    // $($(e.sender.element).parent().parent().get(0).childNodes[3]).replaceWith(function(n){
    //   return '<input class="ifCountry" disabled />';
    // });
    if(e.sender.value() == ''){
        // condition_results.data("kendoDropDownList").enable(false)
    } else {
        // condition_results.data("kendoDropDownList").enable(true)
        for(var i=0;i<sysPermissionDatas.attributeoperatormappings.length;i++) {
            if(sysPermissionDatas.attributeoperatormappings[i].attributeid == first_select_id) {
                var valuetype = sysPermissionDatas.attributeoperatormappings[i].valuetype
                console.log(first_select_id, valuetype)
                if(valuetype != "freetext") {
                    item.childNodes[replace_num].classList.remove("k-textbox")
                    $(item.childNodes[replace_num]).kendoDropDownList({
                        // autoBind: false,
                        optionLabel: "Select",
                        dataTextField: "name",
                        dataValueField: "id"
                    });
                    var third_select_value = sysPermissionDatas.attributeoperatormappings[i].value
                    // let dataSource = new kendo.data.DataSource({data: condition_results_value});
                    let dropdownlist = condition_results.data("kendoDropDownList");
                    dropdownlist.setDataSource(sysPermissionDatas[third_select_value.toLowerCase() + 's']);
                }
                break;
            }
        }
        // condition_results
        
    }
}

function sPermission_change(e){
    let permission_value = e.sender.value(), permission_result_dropdown = sPermissionResult.data("kendoDropDownList"), sPermission_data
    if(permission_value == '') {
        permission_result_dropdown.enable(false) 
    } else if(permission_value == 1) {
        permission_result_dropdown.enable(true)
        sPermission_data = sysPermissionDatas.permissionaccesstypes
    } else if((permission_value == 4) || (permission_value == 5)) {
        permission_result_dropdown.enable(true)
        sPermission_data = sysPermissionDatas.systempositions
    } else if(permission_value == 3) {
        permission_result_dropdown.enable(true)
        sPermission_data = sysPermissionDatas.systemroles
    }

    let dataSource = new kendo.data.DataSource({data: sPermission_data});
    permission_result_dropdown.setDataSource(dataSource);
}

var documetQueryMap = {
    "Country": "countrys",
    "Syndrome": "syndromes",
    "SourceOfInformation": "sourceofinformations",
    "Region": "regions",
    "Language": "languages",
    "Hazard": "hazards",
    "EmrsRole": "",
    "DocumentType": "documenttypes",
    "DocumentCategory": "documentcategorys",
    "DiseaseCond": "diseaseconds",
    "UnicefRegion": "",
    "SouvereginCountry": "",
    "Timezone": "",
    "Aetiology": "aetiologys",
    "Agency": "agencys",
    "ConfidentialityLevel": "",
    "FileFormat": "",
    "SensitiveInfo": "sensitiveinfos",
    "Roles": "roles",
    "InternalExternal": "internalexternals",
    "PermissionAccessType": "",
    "UserOrgPath": "",
    "UserPermissionGroup": "groups",
    "UserBaseLocation": "locations",
    "AssignedLocation": "locations",
    "DeployedLocation": "locations",
    "LocationType": "",
    "AssignmentFunction": "assignmentfunction",
    "AssignmentRole": "",
    "DocumentRole": "documentroles",
    "Occurrence": "occurrences",
    "Admin1": "",
    "Admin2": "",
}

function select_doc_meta_data(e){
    let dataItem = e.dataItem;
    let text = dataItem.name;
    let label_text = dataItem.displayname;
    let value = dataItem.id;


    let doc_meta_wrap = $('#doc-metadata-wrap')
    $("div[dataName='"+text+"']").remove()
    doc_meta_wrap.append($('<div />').attr('class', 'sys-pop-edit-label').attr("dataName", text)
            .append($('<label />').text(label_text)))
        .append($('<div />').attr('class', 'sys-pop-edit-field').attr("dataName", text)
            .append($('<select />').attr("dataName", text).attr("multiple", "multiple")))

    var dataTextField = "name", dataValueField = "id"

    if(text == 'Occurrence') {
        dataTextField = "occurrencename"
    }

    $("select[dataName="+text+"]").kendoMultiSelect({
        autoClose: false,
        dataTextField: dataTextField,
        dataValueField: dataValueField,
        dataSource: documentPermissionDatas[documetQueryMap[text]]
    }).data("kendoMultiSelect");

    if((dataItem.parentid != 0) && (dataItem.edit_default_value == undefined)) {
        $("select[dataName="+text+"]").data("kendoMultiSelect").setDataSource([]);
    }

    if(dataItem.edit_default_value != undefined) {
        $("select[dataName="+text+"]").data("kendoMultiSelect").value(dataItem.edit_default_value);
    }

    var doc_meta_data_value = $("#doc_meta_data").data("kendoMultiSelect").value()


    if(dataItem.childIndices != undefined) {
        switch(text){
            case 'Region':
                $("select[dataName="+text+"]").data("kendoMultiSelect").bind("change", change_region_doc_meta_item);
                break;
            case 'Hazard':
                $("select[dataName="+text+"]").data("kendoMultiSelect").bind("change", change_hazard_doc_meta_item);
                break;
            case 'DocumentCategory':
                $("select[dataName="+text+"]").data("kendoMultiSelect").bind("change", change_document_doc_meta_item);
                break;
            case 'AssignmentFunction':
                $("select[dataName="+text+"]").data("kendoMultiSelect").bind("change", change_assignment_doc_meta_item);
                break;
        }
    }

    if(dataItem.parentid != 0) {
        for(var i=0;i<documentPermissionDatas.mastertypes.length;i++) {
            if(documentPermissionDatas.mastertypes[i].id == dataItem.parentid) {
                let parentItem = documentPermissionDatas.mastertypes[i];
                text = parentItem.name;
                label_text = parentItem.displayname;
                value = parentItem.id;
                doc_meta_data_value.push(value)
                $("#doc_meta_data").data("kendoMultiSelect").value(doc_meta_data_value)

                $("div[dataName='"+text+"']").remove()
                doc_meta_wrap.append($('<div />').attr('class', 'sys-pop-edit-label').attr("dataName", text)
                        .append($('<label />').text(label_text)))
                    .append($('<div />').attr('class', 'sys-pop-edit-field').attr("dataName", text)
                        .append($('<select />').attr("dataName", text).attr("multiple", "multiple")))
                $("select[dataName="+text+"]").kendoMultiSelect({
                    autoClose: false,
                    dataTextField: "name",
                    dataValueField: "id",
                    dataSource: documentPermissionDatas[documetQueryMap[text]]
                }).data("kendoMultiSelect");
                switch(text){
                    case 'Region':
                        $("select[dataName="+text+"]").data("kendoMultiSelect").bind("change", change_region_doc_meta_item);
                        break;
                    case 'Hazard':
                        $("select[dataName="+text+"]").data("kendoMultiSelect").bind("change", change_hazard_doc_meta_item);
                        break;
                    case 'DocumentCategory':
                        $("select[dataName="+text+"]").data("kendoMultiSelect").bind("change", change_document_doc_meta_item);
                        break;
                    case 'AssignmentFunction':
                        $("select[dataName="+text+"]").data("kendoMultiSelect").bind("change", change_assignment_doc_meta_item);
                        break;
                }
                break;
            }
        }
    }

    if(dataItem.childIndices != undefined) {
        for(var i=0;i<dataItem.childIndices.length;i++) {
            let childItem = documentPermissionDatas.mastertypes[dataItem.childIndices[i]];
            text = childItem.name;
            label_text = childItem.displayname;
            value = childItem.id;
            doc_meta_data_value.push(value)
            $("#doc_meta_data").data("kendoMultiSelect").value(doc_meta_data_value)

            $("div[dataName='"+text+"']").remove()
            doc_meta_wrap.append($('<div />').attr('class', 'sys-pop-edit-label').attr("dataName", text)
                    .append($('<label />').text(label_text)))
                .append($('<div />').attr('class', 'sys-pop-edit-field').attr("dataName", text)
                    .append($('<select />').attr("dataName", text).attr("multiple", "multiple")))
            $("select[dataName="+text+"]").kendoMultiSelect({
                autoClose: false,
                dataTextField: "name",
                dataValueField: "id"
            }).data("kendoMultiSelect");
        }
    }
}

function change_region_doc_meta_item(e){
    var selected_values = this.value()
    var sub_items = new Array;
    for(var i=0;i<selected_values.length;i++) {
        for(var j=0;j<documentPermissionDatas.countrys.length;j++) {
            if(selected_values[i] == documentPermissionDatas.countrys[j].regionid)
            sub_items.push(documentPermissionDatas.countrys[j])
        }
    }
    $('select[dataname=Country]').data("kendoMultiSelect").setDataSource(sub_items);
}

function change_hazard_doc_meta_item(e){
    var selected_values = this.value()
    var sub_items = new Array;
    for(var i=0;i<selected_values.length;i++) {
        for(var j=0;j<documentPermissionDatas.diseaseconds.length;j++) {
            if(selected_values[i] == documentPermissionDatas.diseaseconds[j].hazardid)
            sub_items.push(documentPermissionDatas.diseaseconds[j])
        }
    }
    $('select[dataname=DiseaseCond]').data("kendoMultiSelect").setDataSource(sub_items);
}

function change_document_doc_meta_item(e){
    var selected_values = this.value()
    var sub_items = new Array;
    for(var i=0;i<selected_values.length;i++) {
        for(var j=0;j<documentPermissionDatas.documenttypes.length;j++) {
            if(selected_values[i] == documentPermissionDatas.documenttypes[j].documentcategoryid)
            sub_items.push(documentPermissionDatas.documenttypes[j])
        }
    }
    $('select[dataname=DocumentType]').data("kendoMultiSelect").setDataSource(sub_items);
}

function change_assignment_doc_meta_item(e){
    var selected_values = this.value()
    var sub_items = new Array;
    for(var i=0;i<selected_values.length;i++) {
        for(var j=0;j<documentPermissionDatas.documentroles.length;j++) {
            if(selected_values[i] == documentPermissionDatas.documentroles[j].assignmentfunctionid)
            sub_items.push(documentPermissionDatas.documentroles[j])
        }
    }
    $('select[dataname=DocumentRole]').data("kendoMultiSelect").setDataSource(sub_items);
}

function deselect_doc_meta_data(e){
    let dataItem = e.dataItem;
    let text = dataItem.name;
    let value = dataItem.id;

    $("div[dataName='"+text+"']").remove()

    if(dataItem.parentid != 0) {
        var doc_meta_data_value = $("#doc_meta_data").data("kendoMultiSelect").value()
        for(var i=0;i<doc_meta_data_value.length;i++) {
            if(doc_meta_data_value[i] == value) {
                doc_meta_data_value.splice(i, 1)
                $("#doc_meta_data").data("kendoMultiSelect").value(doc_meta_data_value)
                break;
            }
        }
        for(var i=0;i<documentPermissionDatas.mastertypes.length;i++) {
            if(documentPermissionDatas.mastertypes[i].id == dataItem.parentid) {
                let parentItem = documentPermissionDatas.mastertypes[i];
                text = parentItem.name;
                label_text = parentItem.displayname;
                value = parentItem.id;
                doc_meta_data_value = $("#doc_meta_data").data("kendoMultiSelect").value()
                for(var i=0;i<doc_meta_data_value.length;i++) {
                    if(doc_meta_data_value[i] == value) {
                        doc_meta_data_value.splice(i, 1)
                        $("#doc_meta_data").data("kendoMultiSelect").value(doc_meta_data_value)
                        break;
                    }
                }

                $("div[dataName='"+text+"']").remove()
                break;
            }
        }
    }

    if(dataItem.childIndices.length > 0) {
        var doc_meta_data_value = $("#doc_meta_data").data("kendoMultiSelect").value()
        for(var j=0;j<doc_meta_data_value.length;j++) {
            if(doc_meta_data_value[j] == value) {
                doc_meta_data_value.splice(j, 1)
                $("#doc_meta_data").data("kendoMultiSelect").value(doc_meta_data_value)
                break;
            }
        }
        for(var i=0;i<dataItem.childIndices.length;i++) {
            let childItem = documentPermissionDatas.mastertypes[dataItem.childIndices[i]];
            text = childItem.name;
            label_text = childItem.displayname;
            value = childItem.id;
            doc_meta_data_value = $("#doc_meta_data").data("kendoMultiSelect").value()
            for(var j=0;j<doc_meta_data_value.length;j++) {
                if(doc_meta_data_value[j] == value) {
                    doc_meta_data_value.splice(j, 1)
                    $("#doc_meta_data").data("kendoMultiSelect").value(doc_meta_data_value)
                    break;
                }
            }
            $("div[dataName='"+text+"']").remove()
        }
    }
}

function select_user_meta_data(e){
    let dataItem = e.dataItem;
    let text = dataItem.name;
    let label_text = dataItem.displayname
    let value = dataItem.id;

    let doc_meta_wrap = $('#user-metadata-wrap')
    doc_meta_wrap.append($('<div />').attr('class', 'sys-pop-edit-label').attr("dataName", text)
            .append($('<label />').text(label_text)))
        .append($('<div />').attr('class', 'sys-pop-edit-field').attr("dataName", text)
            .append($('<select />').attr("dataName", text).attr("multiple", "multiple")))

    var dataTextField = "name", dataValueField = "id"

    if(text == 'UserPermissionGroup') {
        dataTextField = "groupname"
        dataValueField = "groupid"
    }

    if(documentPermissionDatas[documetQueryMap[text]] != undefined) {
        $("select[dataName='"+text+"']").kendoMultiSelect({
            autoClose: false,
            dataTextField: dataTextField,
            dataValueField: dataValueField,
            dataSource: documentPermissionDatas[documetQueryMap[text]],
            value: dataItem.edit_default_value
        }).data("kendoMultiSelect");
    } else {
        $('div.sys-pop-edit-field[dataName='+text).empty();
        $('div.sys-pop-edit-field[dataName='+text).append($('<input>').addClass('k-textbox').attr("dataName", text).attr('type', 'text').val(dataItem.edit_default_value))
    }
    
}

function deselect_user_meta_data(e){
    let dataItem = e.dataItem;
    let text = dataItem.name;
    let value = dataItem.id;

    $("div[dataName='"+text+"']").remove()
}