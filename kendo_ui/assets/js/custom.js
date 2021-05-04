let top_id = 0, AssignmentFunctionData = [], HazardData = [], assignmentRoleData, condition_results, condition_results_value, sPermissionResult, systemRolesValue, systemPositionsValue, sPermission;

var dataSourceMasterType = [
        { "text": "Assignment Function", "value": "Assignment Function" },
        { "text": "Hazard", "value": "Hazard" }
    ];

//================== MSAL Auth Block Start =============
var EMRSconfig={
    clientId: "cfc9f18c-9a43-4d6a-a556-f338be15619d",
    authority: "https://login.microsoftonline.com/171d96c1-7170-4561-a662-66c07e043e23",
    redirectUri: "https://kendoui.azurewebsites.net",
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
            }
        }
        console.log(username)
        // document.getElementById("userinfo").value=username;
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

function fetchusers()
{
    getTokenRedirect(loginRequest).then(response => {
        fetch('https://emrsapi.azurewebsites.net/api/documents/drives', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            "Authorization": "Bearer " + response.accessToken
          }
        })
        .then(response => response.json())
        .then(data => {
          document.getElementById("responsetxt").value=JSON.stringify(data);
        })
        .catch((error) => {
          document.getElementById("responsetxt").value=error;
        });
        
    }).catch(error => {
        console.error(error);
    });
}


//================== MSAL Auth Block End =============


function masterTypeChange(e){
    let dataItem = this.dataItem(e.item);
    if(dataItem.value == "Hazard"){
        $('.popNone').addClass('show')
        $('.popPartNone').addClass('show')
    } else if(dataItem.value == "Assignment Function") {
        $('.popNone').addClass('show')
        $('.popPartNone').removeClass('show')
    } else {
        $('.popNone').removeClass('show')
    }
}

function add_child(masterType, parentId){
    setTimeout(function(){
        let masterDropdownlist = $("#masterType").data("kendoDropDownList");
        masterDropdownlist.value(masterType);
        masterDropdownlist.trigger("change");
        if(parentId != null && parentId > -1) {
            let parentDropdownlist = $("#AssignmentFunctionId").data("kendoDropDownList");
            parentDropdownlist.value(parentId);
            parentDropdownlist.trigger("change");
        }
    }, 500)
}

function filter_data(service_data, json_data, masterType, masterValue) {
    let temp_data = json_data.value;
    let service_temp_data = service_data;
    for(let i = 0; i < temp_data.length; i++){
        let data_ele = {};
        data_ele.masterType = masterType;
        data_ele.masterValue = masterValue;
        data_ele.Id = temp_data[i].Id;
        if(temp_data[i].AssignmentFunctionId == undefined && temp_data[i].HazardId == undefined){
            // data_ele.AssignmentFunctionId = null;
            if(masterValue == 1) {
                AssignmentFunctionData.push({value: temp_data[i].Id, text: temp_data[i].Name})
                data_ele.AssignmentFunctionId = -1;
            } else {
                HazardData.push({value: temp_data[i].Id, text: temp_data[i].Name})
                data_ele.AssignmentFunctionId = -2;
            }
        } else if(temp_data[i].HazardId == undefined) {
            data_ele.AssignmentFunctionId = temp_data[i].AssignmentFunctionId
        } else {
            data_ele.AssignmentFunctionId = temp_data[i].HazardId
        }
        data_ele.Name = temp_data[i].Name;
        data_ele.EmsCode = temp_data[i].EmsCode
        data_ele.EmsName = temp_data[i].EmsName
        data_ele.SyncToEms = temp_data[i].SyncToEms
        data_ele.vShocCode = temp_data[i].vShocCode
        data_ele.vShocName = temp_data[i].vShocName
        data_ele.SyncTovShoc = temp_data[i].SyncTovShoc

        service_temp_data.push(data_ele);
    }
    return service_temp_data;
}

function delete_if_condition(ele) {
    $(ele).parent().parent().remove()
}

$(document).ready(function() {

    $("#tabstrip").kendoTabStrip({
        animation:  {
            open: {
                effects: "fadeIn"
            }
        }
    });

    //TreeList(Reference Data) Start
    
    let getReferenceJsonData = new Promise(function(myResolve, myReject) {
        let service_data = [{
            masterType: 'Assignment Function',
            masterValue: '',
            Id: -1,
            Name: 'Assignment Function',
            EmsCode: '',
            EmsName: '',
            SyncToEms: '',
            vShocCode: '',
            vShocName: '',
            SyncTovShoc: '',
            AssignmentFunctionId: null
        }, {
            masterType: 'Hazard',
            masterValue: '',
            Id: -2,
            Name: 'Hazard',
            EmsCode: '',
            EmsName: '',
            SyncToEms: '',
            vShocCode: '',
            vShocName: '',
            SyncTovShoc: '',
            AssignmentFunctionId: null
        }]
        $.getJSON( "EMRS_Reference_data/AssignmentFunction.json").then(function( data ) {

            service_data = filter_data(service_data, data, 'Assignment Function', 1);
        });
        $.getJSON( "EMRS_Reference_data/AssignmentRole.json").then(function( data ) {

            service_data = filter_data(service_data, data, 'Assignment Function', 1);
            assignmentRoleData = data.value
        });
        $.getJSON( "EMRS_Reference_data/hazard.json").then(function( data ) {

            service_data = filter_data(service_data, data, 'Hazard', 2);
        });
        $.getJSON( "EMRS_Reference_data/DiseaseCond.json").then(function( data ) {

            service_data = filter_data(service_data, data, 'Hazard', 2);

            top_id = service_data[service_data.length - 1].Id
            myResolve(service_data);
        });
        
    });

    getReferenceJsonData.then(
        function(service_data) {

            let crudServiceBaseUrl = "https://demos.telerik.com/kendo-ui/service";

            let dataSource = new kendo.data.TreeListDataSource({
                    transport: {
                        read: function(e) {
                            e.success(service_data)
                        },
                        update: function(e) {
                            let updatedItem = e.data.models;
                            e.success();
                        },
                        destroy: function(e) {
                            e.success();
                        },
                        create: function(e) {
                            e.data.models[0].Id = ++top_id
                            if(e.data.models[0].AssignmentFunctionId == null){
                                if(e.data.models[0].masterType == 'Assignment Function'){
                                    e.data.models[0].AssignmentFunctionId = -1
                                } else {
                                    e.data.models[0].AssignmentFunctionId = -2
                                }
                            }

                            if(e.data.models[0].AssignmentFunctionId == -1){
                                AssignmentFunctionData.push({value: top_id, text: e.data.models[0].Name})
                            } else if(e.data.models[0].AssignmentFunctionId == -2){
                                HazardDatas.push({value: top_id, text: e.data.models[0].Name})
                            }
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
                            id: "Id",
                            parentId: "AssignmentFunctionId",
                            fields: {
                                masterType: { field: "masterType", nullable: false },
                                Id: { type: "number", editable: false, nullable: false },
                                AssignmentFunctionId: { field: "AssignmentFunctionId", nullable: true },
                                EmsCode: { field: "EmsCode", nullable: true },
                                EmsName: { field: "EmsName", nullable: true },
                                SyncToEms: { field: "SyncToEms", nullable: true, type: "Boolean" },
                                vShocCode: { field: "vShocCode", nullable: true },
                                vShocName: { field: "vShocName", nullable: true },
                                SyncTovShoc: { field: "SyncTovShoc", nullable: true }
                            },
                        }
                    },
                    pageSize: 15
                });
            

            $("#treelist").kendoTreeList({
                dataSource: dataSource,
                // toolbar: kendo.template($("#toolbar-template").html()) ,
                toolbar: [ "search", "create" ],
                // height: 600,
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
                        { field: "Id", title: "ID", template: $("#id-template").html()},
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
                        buttons += '<button type="button" data-command="createchild" class="k-button k-button-icontext k-grid-add" onClick="add_child(\'' + dataItem.masterType + '\',' + null + ')"><span class="k-icon k-i-plus"></span>Add</button>';
                        if(dataItem.Id > -1){
                            buttons += '<button type="button" data-command="edit" class="k-button k-button-icontext k-grid-edit" onClick="add_child(\'' + dataItem.masterType + '\',' + dataItem.AssignmentFunctionId + ')"><span class="k-icon k-i-edit"></span>Edit</button>';
                        }
                        if(!dataItem.hasChildren){
                            buttons += '<button type="button" data-command="destroy" class="k-button k-button-icontext k-grid-delete"><span class="k-icon k-i-close"></span>Delete</button>';
                        }
                        buttons += '</div>';
                        return buttons;
                    },
                    width: 270 
                }],
                pageable: {
                    pageSize: 15,
                    pageSizes: true
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
        },
            function(error) {
                console.error('error')
            }
        );

    //===================================  TreeList(ReferenceData) block End.  ==============================================================================

    //=====================================  System Permission Block Start  =================================================================================

    let sPermission_data = new Array();
    let sCondition = new Array();
    let sOperator = new Array();
    let sCountry = new Array();

    $.getJSON( "user_permissions_reference_data/conditions.json").then(function( data ) {
        sCondition = data.value
    });
    
    $.getJSON( "user_permissions_reference_data/operator.json").then(function( data ) {
        sOperator = data.value
    });
    
    $.getJSON( "user_permissions_reference_data/Country.json").then(function( data ) {
        sCountry = data.value
        condition_results_value = data.value
    });
    
    $.getJSON( "user_permissions_reference_data/systemroles.json").then(function( data ) {
        systemRolesValue = data.value
    });
    
    $.getJSON( "user_permissions_reference_data/systempositions.json").then(function( data ) {
        systemPositionsValue = data.value
    });

    let getSystemPermissionData = new Promise(function(myResolve, myReject) {
        

        $.getJSON( "EMRS_Reference_data/system_permissions.json").then(function( data ) {

            sPermission_data = data.value

            myResolve(sPermission_data);
        });
    });

    getSystemPermissionData.then(function(sPermission_data){
        $("#system-permission").kendoGrid({
            dataSource: {
                data: sPermission_data,
                schema: {
                    model: {
                        fields: {
                            name: { field: "name", nullable: false },
                            description: { field: "description" },
                            ruleDefination: {defaultValue: {
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
    },
    function(error) {
        // console.error('error')
    })

    let sys_pop = $("#sys-pop").kendoWindow({
        dataSource: {
            type: "object"
        },
        content: {
            iframe: true
        },
        actions: ["Custom", "Minimize", "Maximize", "Close"],
        draggable: true,
        resizable: true,
        width: "500px",
        modal: true,
        title: "Edit",
        visible: false,
        open: function(e) {
            $("#status").kendoSwitch();
            $(".ifCondition").kendoDropDownList({
                optionLabel: "Select",
                dataTextField: "DisplayName",
                dataValueField: "Id",
                dataSource: sCondition,
                change: ifCondition_change
            });
            $(".ifOperator").kendoDropDownList({
                optionLabel: "Select",
                dataTextField: "name",
                dataValueField: "operatorId",
                dataSource: sOperator
            });
            condition_results = $(".ifCountry").kendoDropDownList({
                autoBind: false,
                optionLabel: "Select",
                dataTextField: "Name",
                dataValueField: "Id"
            });

            $('#add-if-condition').on('click', function(e){
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
                    dataTextField: "DisplayName",
                    dataValueField: "Name",
                    dataSource: sCondition,
                    change: ifCondition_change
                })
                ifOperator.kendoDropDownList({
                    optionLabel: "Select",
                    dataTextField: "name",
                    dataValueField: "operatorId",
                    dataSource: sOperator
                })
                ifCountry.kendoDropDownList({
                    autoBind: false,
                    optionLabel: "Select",
                    dataTextField: "Name",
                    dataValueField: "Id"
                })
                $("#sys-pop").data("kendoWindow").center()
            })

            sPermission = $("#sPermission").kendoDropDownList({
                optionLabel: "Select",
                dataTextField: "text",
                dataValueField: "value",
                dataSource: [{"value":1,"text":"Access"},{"value":2,"text":"Remove Position"},{"value":3,"text":"Update Role"},{"value":4,"text":"Add Position"}],
                change: sPermission_change
            });

            sPermissionResult = $("#sPermissionResult").kendoDropDownList({
                optionLabel: "Select",
                dataTextField: "Name",
                dataValueField: "Id"
            });

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
        } else {
            row = $(this).closest("tr");
            grid = $("#system-permission").data("kendoGrid");
            dataItem = grid.dataItem(row);
            viewModel = kendo.observable(sPermission_data[row.index()]);
            kendoDialog = kendo.template($("#sys-permission-popup-template").html());
            sys_pop.data("kendoWindow").content(kendoDialog(viewModel)).center().open()
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
            edited_sys_permission.ruleDefination = {}
            edited_sys_permission.ruleDefination.ifCondition = new Array()
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
            
                edited_sys_permission.ruleDefination.ifCondition.push(ifCondition_val)
            }

            edited_sys_permission.ruleDefination.thenCondition = new Array()
            let thenCondition_val = {}
            thenCondition_val.permission = {
                "id":$("#sPermission").data("kendoDropDownList").value(),
                "name":$("#sPermission").data("kendoDropDownList").text()
            }
            thenCondition_val.value = {
                "id":$("#sPermissionResult").data("kendoDropDownList").value(),
                "name":$("#sPermissionResult").data("kendoDropDownList").text()
            }

            edited_sys_permission.ruleDefination.thenCondition.push(thenCondition_val)

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
    let dPermissionType = new Array();
    
    $.getJSON( "document_permissions_metadata/documentmetadata.json").then(function( data ) {
        dDocumentMetaData = data.value
    });
    
    $.getJSON( "document_permissions_metadata/usermetadata.json").then(function( data ) {
        dUserMetaData = data
    });
    
    $.getJSON( "document_permissions_metadata/permissiontype.json").then(function( data ) {
        dPermissionType = data.value
    });




    let getDocumentPermissionData = new Promise(function(myResolve, myReject) {
        

        $.getJSON( "EMRS_Reference_data/document_permissions.json").then(function( data ) {

            dPermission_data = data.value

            myResolve(dPermission_data);
        });
    });

    getDocumentPermissionData.then(function(sPermission_data){
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
            editable: {
                mode: "popup",
                template: $("#sys-permission-popup-template").html()
            },
            columns: [
                { field: "name", title: "Name" },
                { title: "Document Metadata", template: $("#doc-metadata-template").html() },
                { title: "User Metadata", template: $("#doc-metadata-template").html() },
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
    },
    function(error) {
        // console.error('error')
    })

    let doc_pop = $("#doc-pop").kendoWindow({
        dataSource: {
            type: "object"
        },
        content: {
            iframe: true
        },
        actions: ["Minimize", "Maximize", "Close"],
        draggable: true,
        resizable: true,
        width: "500px",
        modal: true,
        title: "Edit",
        visible: false,
        open: function(e) {
            $("#active_status").kendoSwitch();
            let doc_meta_data = $("#doc_meta_data").kendoMultiSelect({
                autoClose: false,
                dataTextField: "name",
                dataValueField: "id",
                dataSource: dDocumentMetaData,
                select: select_doc_meta_data,
                deselect: deselect_doc_meta_data
            }).data("kendoMultiSelect");
            let user_meta_data = $("#user_meta_data").kendoMultiSelect({
                autoClose: false,
                dataTextField: "name",
                dataValueField: "id",
                dataSource: dUserMetaData,
                select: select_user_meta_data,
                deselect: deselect_user_meta_data
            }).data("kendoMultiSelect");
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
        } else {
            row = $(this).closest("tr");
            grid = $("#document-permission").data("kendoGrid");
            dataItem = grid.dataItem(row);
            viewModel = kendo.observable(dPermission_data[row.index()]);
            kendoDialog = kendo.template($("#doc-permission-popup-template").html());
            doc_pop.data("kendoWindow").content(kendoDialog(viewModel)).center().open()
        }
        
        
    
        $('.edit-doc-permission').on('click', function(e){
            let edited_doc_permission = {}
            edited_doc_permission.name = $('#doc_name').val()
            edited_doc_permission.id = '0'
            edited_doc_permission.permissionDescription = $('#doc_description').val()
            edited_doc_permission.grantType = $('input[name=doc_permission]:checked').val()
            edited_doc_permission.status = $('#active_status').get(0).checked
            edited_doc_permission.ruleDefination = {}
            edited_doc_permission.ruleDefination.DocumentMetadata = new Array();
            let document_metadatas = $("#doc_meta_data").data("kendoMultiSelect").dataItems()
            for(let i=0;i<document_metadatas.length;i++){
                edited_doc_permission.ruleDefination.DocumentMetadata.push({
                    "id": document_metadatas[i].id,
                    "itemName": document_metadatas[i].name
                })
            }

            let document_metadata_items = $("#doc-metadata-wrap select")

            for(let i=0;i<document_metadata_items.length;i++){
                let document_metadata_values = $(document_metadata_items[i]).data("kendoMultiSelect").dataItems()
                let key = $(document_metadata_items[i]).attr('dataName')

                edited_doc_permission.ruleDefination[key] = new Array();
                for(let j=0;j<document_metadata_values.length;j++){
                    edited_doc_permission.ruleDefination[key].push({
                        "id": document_metadata_values[j].Id,
                        "itemName": document_metadata_values[j].Name
                    })
                }
            }

            edited_doc_permission.ruleDefination.UserMetadata = new Array();
            let user_metadatas = $("#user_meta_data").data("kendoMultiSelect").dataItems()
            for(let i=0;i<user_metadatas.length;i++){
                edited_doc_permission.ruleDefination.UserMetadata.push({
                    "id": user_metadatas[i].id,
                    "itemName": user_metadatas[i].name
                })
            }

            document_metadata_items = $("#user-metadata-wrap select")

            for(let i=0;i<document_metadata_items.length;i++){
                let document_metadata_values = $(document_metadata_items[i]).data("kendoMultiSelect").dataItems()
                let key = $(document_metadata_items[i]).attr('dataName')

                edited_doc_permission.ruleDefination[key] = new Array();
                for(let j=0;j<document_metadata_values.length;j++){
                    edited_doc_permission.ruleDefination[key].push({
                        "id": document_metadata_values[j].Id,
                        "itemName": document_metadata_values[j].Name
                    })
                }
            }


            if(key == 'edit') {
                dPermission_data[row.index()] = edited_doc_permission
            } else {
                dPermission_data.unshift(edited_doc_permission)
            }
            

            $("#document-permission").data("kendoGrid").dataSource.read();

            doc_pop.data("kendoWindow").close()

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
        // expressionPreview: true,
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
    condition_results = $(e.sender.element).parent().parent().find('input.ifCountry')
    if(e.sender.value() == ''){
        condition_results.data("kendoDropDownList").enable(false)
    } else {
        condition_results.data("kendoDropDownList").enable(true)
        // condition_results
        let dataSource = new kendo.data.DataSource({data: condition_results_value});
        let dropdownlist = condition_results.data("kendoDropDownList");
        dropdownlist.setDataSource(dataSource);
    }
}

function sPermission_change(e){
    let permission_value = e.sender.value(), permission_result_dropdown = sPermissionResult.data("kendoDropDownList"), sPermission_data
    if(permission_value == '') {
        permission_result_dropdown.enable(false) 
    } else if(permission_value == 1) {
        permission_result_dropdown.enable(true)
        sPermission_data = [{
            "Id": 1,
            "Name": "FullAccess"
        }, {
            "Id": 2,
            "Name": "Deny"
        }]
    } else if(permission_value == 2) {
        permission_result_dropdown.enable(true)
        sPermission_data = systemRolesValue
    } else if(permission_value == 3) {
        permission_result_dropdown.enable(true)
        sPermission_data = systemPositionsValue
    } else {
        permission_result_dropdown.enable(true)
        sPermission_data = systemPositionsValue
    }

    let dataSource = new kendo.data.DataSource({data: sPermission_data});
    permission_result_dropdown.setDataSource(dataSource);
}

function select_doc_meta_data(e){
    let dataItem = e.dataItem;
    let text = dataItem.name;
    let value = dataItem.id;

    let doc_meta_wrap = $('#doc-metadata-wrap')
    doc_meta_wrap.append($('<div />').attr('class', 'sys-pop-edit-label').attr("dataName", text)
            .append($('<label />').text(text)))
        .append($('<div />').attr('class', 'sys-pop-edit-field').attr("dataName", text)
            .append($('<select />').attr("dataName", text).attr("multiple", "multiple")))
    $("select[dataName="+text+"]").kendoMultiSelect({
        autoClose: false,
        dataTextField: "Name",
        dataValueField: "Id",
        dataSource: assignmentRoleData
    }).data("kendoMultiSelect");
}

function deselect_doc_meta_data(e){
    let dataItem = e.dataItem;
    let text = dataItem.name;
    let value = dataItem.id;

    $("div[dataName='"+text+"']").remove()
}

function select_user_meta_data(e){
    let dataItem = e.dataItem;
    let text = dataItem.name;
    let value = dataItem.id;

    let doc_meta_wrap = $('#user-metadata-wrap')
    doc_meta_wrap.append($('<div />').attr('class', 'sys-pop-edit-label').attr("dataName", text)
            .append($('<label />').text(text)))
        .append($('<div />').attr('class', 'sys-pop-edit-field').attr("dataName", text)
            .append($('<select />').attr("dataName", text).attr("multiple", "multiple")))
    $("select[dataName='"+text+"']").kendoMultiSelect({
        autoClose: false,
        dataTextField: "Name",
        dataValueField: "Id",
        dataSource: assignmentRoleData
    }).data("kendoMultiSelect");
}

function deselect_user_meta_data(e){
    let dataItem = e.dataItem;
    let text = dataItem.name;
    let value = dataItem.id;

    $("div[dataName='"+text+"']").remove()
}