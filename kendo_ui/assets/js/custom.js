let top_id = 0, AssignmentFunctionData = [], HazardData = [], assignmentRoleData, condition_results, condition_results_value, sPermissionResult, systemRolesValue, systemPositionsValue, sPermission, membershipDatas;

var refTreeList
var dataSourceMasterType = [
        { "text": "Assignment Function", "value": "Assignment Function" },
        { "text": "Hazard", "value": "Hazard" }
    ];

const USER_PERMISSION_MAP = {
        "Global Administrators": {
            "ReferenceData": 2,
            "SystemPermission": 2,
            "DocumentPermission": 2,
            "GroupMembership": 4,
            "UserPermissionSimulation": 1
        },
        "User Administrators": {
            "GroupMembership": 2,
            "UserPermissionSimulation": 1
        },
        "Groups Administrators": {
            "GroupMembership": 3,
            "UserPermissionSimulation": 1
        },
        "Reference Data Administrators": {
            "ReferenceData": 2
        },
        "Reference Data Readers": {
            "ReferenceData": 1
        },
        "Permission Rules Administrators": {
            "SystemPermission": 2,
            "DocumentPermission": 2,
            "UserPermissionSimulation": 1
        },
        "Permission Rules Readers": {
            "SystemPermission": 1,
            "DocumentPermission": 1,
            "UserPermissionSimulation": 1
        },
        "Document Administrators": {
            "DocumentPermission": 2
        }
    }
var USER_PERMISSION = {
        "ReferenceData":0,
        "SystemPermission":0,
        "DocumentPermission":0,
        "GroupMembership":0,
        "UserPermissionSimulation":0
    }
var documentPermissionDatas, documentPermissionTabOpen = true, sysPermissionDatas, sysPermissionTabOpen = true, referenceDataTabOpen = true, permissionSimulationTabOpen = true, userMembershipTabOpen = true;
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
        "locations{id,name}" +
        "assignmentfunctions{id,name}" +
        "informationconfidentialitys{id,name}}"

const sys_fetch_body = '{userpermissions(sortBy:{field:"name",direction:"asc"}){id,name,description,application{id, name},ruledefination}' +
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
        'permissionaccesstypes{id,name}' +
        'groups(grouptypes:1){groupid,groupname}}'

const usernames = [
    {
        "email": "tester1@crisissystemsatlanta.onmicrosoft.com",
        "name": "L094gTrS",
        "api": "5cd7eb40-645e-4137-9657-be35e70043e3",
        "permission": "Global Administrators"
    },{
        "email": "testertwo@crisissystemsatlanta.onmicrosoft.com",
        "name": "Jura0261",
        "api": "6fb6f74d-de91-4238-8128-f669f1a5b31c",
        "permission": "User Administrators"
    },{
        "email": "testerthree@crisissystemsatlanta.onmicrosoft.com",
        "name": "Guwa5750",
        "api": "f4592ee8-9754-4e94-ab5f-e35b886e015a",
        "permission": "Reference Data Administrators"
    },{
        "email": "testerfour@crisissystemsatlanta.onmicrosoft.com",
        "name": "Najo7817",
        "api": "749259f7-b433-4ff8-b99d-5cfd40c14537",
        "permission": "Reference Data Readers"
    },{
        "email": "testerfive@crisissystemsatlanta.onmicrosoft.com",
        "name": "Zuho3908",
        "api": "d937c46b-169d-4df1-82a4-7a8eac1f2a14",
        "permission": "Permission Rules Administrators"
    },{
        "email": "testersix@crisissystemsatlanta.onmicrosoft.com",
        "name": "Toso9566",
        "api": "3399f4f0-03bb-4ae6-a638-07883af3ab93",
        "permission": "Permission Rules Readers"
    },{
        "email": "testerseven@crisissystemsatlanta.onmicrosoft.com",
        "name": "Rawa1524",
        "api": "cc8ae96e-665c-4781-911d-c127d1cbd931",
        "permission": "Document Administrators"
    },{
        "email": "testereight@crisissystemsatlanta.onmicrosoft.com",
        "name": "Duho2152",
        "api": "b343c38e-7076-4864-896d-d93355b41e0f",
        "permission": "Groups Administrators"
    },{
        "email": "testernine@crisissystemsatlanta.onmicrosoft.com",
        "name": "Mayo7712",
        "api": "66e6a4f8-f6b8-44c9-ace8-1a493a05de07",
        "permission": "Groups Administrators, Global Administrators, Reference Data Readers"
    },{
        "email": "testerten@crisissystemsatlanta.onmicrosoft.com",
        "name": "Buda7203",
        "api": "b537adb0-04c4-432d-aa67-0a732a59d240",
        "permission": "Reference Data Administrators, Permission Rules Readers, Groups Administrators"
    }
]

// Membership Tab variables
var membership_length_fetch_data = '{users{aggregate_count,aggregate_userid_max}}'
var membership_fetch_data = '{users(limitItems:15,offset:0,sortBy:{field:"lastname",direction:"asc"}){userid,emailaddress,firstname,lastname,orgpath,region{name},country{name},locationtype{name},internalexternal{name},agency,groupmemberships{group{groupid}}}}'
var membership_fetch_data_end = '){userid,emailaddress,firstname,lastname,orgpath,region{name},country{name},locationtype{name},internalexternal{name},agency,groupmemberships{group{groupid}}}}'
var MEMBERSHIP_LENGTH = 0, membership_pager;

var loader = $('#loader').kendoLoader({
        themeColor:'primary',
        type: "converging-spinner"
    }).data("kendoLoader");
// ================== MSAL Auth Block Start =============

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

        get_user_permission()
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

            get_user_permission()
        }
    }
    $('.username-wrap').text(username)
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

function get_user_permission(){
    getTokenRedirect(loginRequest).then(response => {
        fetch(EMRSconfig.apiUri + '/graphql', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            "Authorization": "Bearer " + response.accessToken
          }, // {user(emailaddress: "krupeninyuri@gmail.com"){id}}
          body: JSON.stringify({query:'{user(emailaddress: "'+ username +'"){userid}}'})
        })
        .then(response => response.json())
        .then(userdata => {
            if(!userdata || !userdata.data || !userdata.data.user || !userdata.data.user.userid)
            {
                $('#loader-wrap').addClass('hide')
                kendo.alert("The user " + username + " doesn't have access to this application.");
                return;
            }
            fetch(EMRSconfig.apiUri + '/graphql', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                "Authorization": "Bearer " + response.accessToken
              },
              body: JSON.stringify({query:'{groupmemberships(userid:"'+ userdata.data.user.userid +'"){group(grouptypes: 0) {groupname}}}'})
            })
            .then(response => response.json())
            .then(data => {
                $('#loader-wrap').addClass('hide')
                if(!data || !data.data || !data.data.groupmemberships || data.data.groupmemberships.length==0)
                {
                    kendo.alert("No groups are assigned to the user " + username + ".");
                    return;
                }
                if(data.errors) {
                    kendo.alert(data.errors[0].message);
                } else {
                    var groupMemberships = data.data.groupmemberships
                    groupMemberships.map((groupMembership) => {
                        if(groupMembership.group != null){
                            var key = groupMembership.group.groupname
                            var permission_types = USER_PERMISSION_MAP[key]
                            Object.keys(permission_types).map((permission_key) => {
                                if(permission_types[permission_key] > USER_PERMISSION[permission_key]) {
                                    USER_PERMISSION[permission_key] = permission_types[permission_key]
                                }
                            })
                        }
                    })
                }
            })
        })
        .catch((error) => {
            $('#loader-wrap').addClass('hide')
            console.log(error)
        });
    })
    .catch(error => {
        $('#loader-wrap').addClass('hide')
        kendo.alert("You don’t have access to EMRS Reference Data, please contact the Administrator.");
    });
}

async function fetchMasterType()
{
    getTokenRedirect(loginRequest).then(response => {
        fetch(EMRSconfig.apiUri + '/graphql', {
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
            fetchReferenceData()
        })
        .catch((error) => {
            console.log(error)
        });
        
    }).catch(error => {
        kendo.alert("You don’t have access to EMRS Reference Data, please contact the Administrator.");
    });
    
}
var order_null_number = 0;

var fetchReferenceData = async () => {
    let myPromise = new Promise(async function(myResolve, myReject) {
        var total_index = urls.length
        var present_index = 0
        try {
            const response = await Promise.all(urls.map((url, url_index) =>{
                getTokenRedirect(loginRequest).then(response => {
                    fetch(EMRSconfig.apiUri + '/referenceData/items/' + url.name, {
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
                            for(var i=0;i<temp_data.length;i++){
                                if(temp_data[i].OrderId == undefined || temp_data[i].OrderId == null || temp_data[i].OrderId == 0) order_null_number++
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
            // sort by "OrderId"
            { field: "OrderId", dir: "asc" },
            { field: "id", dir: "asc" }
        ],
        pageSize: 15
    });
    
    var reorderable = true;
    if(USER_PERMISSION.ReferenceData != 2){
        reorderable = false;
    }

    refTreeList = $("#treelist").kendoTreeList({
        dataSource: dataSource,
        toolbar: $("#reference-toolbar-template").html(),
        editable: {
            mode: "popup",
            template: $("#popup-template").html(),
            move: {
                reorderable: reorderable
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
                if(USER_PERMISSION.ReferenceData == 2) {
                    if(dataItem.parentid == null) {
                        buttons += '<button type="button" class="k-button k-button-icontext k-grid-add" onClick="add_child(' + dataItem.id + ')"><span class="k-icon k-i-plus"></span>Add</button>';
                    } else {
                        buttons += '<button type="button" class="k-button k-button-icontext k-grid-add" onClick="add_child(' + dataItem.masterType + ')"><span class="k-icon k-i-plus"></span>Add</button>';
                    }
                }
                if(dataItem.Id > -1){
                    if(USER_PERMISSION.ReferenceData == 2){
                        buttons += '<button type="button" class="k-button k-button-icontext k-grid-edit" onClick="edit_child(' + dataItem.id + ',\'' + dataItem.masterType + '\')"><span class="k-icon k-i-edit"></span>Edit</button>';
                    } else {
                        buttons += '<button type="button" class="k-button k-button-icontext k-grid-edit" onClick="edit_child(' + dataItem.id + ',\'' + dataItem.masterType + '\')"><span class="k-icon k-i-edit"></span>View</button>';
                    }
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
        filterable: false,
        navigatable: true,
        drop: reorderReferenceData
    });

    let treeList = $("#treelist").data("kendoTreeList");
    // let rows = $("tr.k-treelist-group", treeList.tbody);

    $('.k-input').on('keydown input', function(event){
        if($(this).val() != '') {
            var dataItems = treeList.dataSource.data();
            $.each(dataItems, function(i, item) {
                item.expanded = true;
            });
            treeList.dataSource.data(dataItems);
        } else {
            var dataItems = treeList.dataSource.data();
            $.each(dataItems, function(i, item) {
                item.expanded = false;
            });
            treeList.dataSource.data(dataItems);
        }
    })
}

function compare( a, b ) {
    if ( a.OrderId < b.OrderId ){
        return -1;
    }
    if ( a.OrderId > b.OrderId ){
        return 1;
    }
    return 0;
}

function patchReferenceDataOrder(source_data, index, accessToken,secondEditDatas) {
    return new Promise(resolve => {
        $.ajax({
                    url: EMRSconfig.apiUri + '/referenceData/items',
                    headers: {
                        'Content-Type': 'application/json',
                        "Authorization": "Bearer " + accessToken
                    },
                    type: 'PATCH',
                    data: JSON.stringify(source_data),
                    cache:false,
                    contentType: false,
                    processData: false,
                    success: function (data) {
                        for(j=0;j<referenceDatas.length;j++){
                            if((referenceDatas[j].Id == data.value.Id) && (referenceDatas[j].CreatedBy == data.value.CreatedBy)) {
                                referenceDatas[j].OrderId = data.value.OrderId;
                                referenceDatas[j].ModifiedBy = data.value.ModifiedBy
                                referenceDatas[j].ModifiedDate = data.value.ModifiedDate
                                $("#treelist").data("kendoTreeList").dataSource.pushUpdate(referenceDatas[j]);
                                break;
                            }
                        }
                        if(index == (secondEditDatas.length - 1)) {
                            $('#loader-wrap').addClass('hide')
                            $("#treelist").data("kendoTreeList").refresh();
                        }
                        resolve('success');
                    },
                    error: function (data) {
                        $('#loader-wrap').addClass('hide')
                        resolve('error');
                        //kendo.alert("Reordering is failed.");
                    }
                });
  });
}

async function patchAsync(source_data, index, accessToken,secondEditDatas){
  await patchReferenceDataOrder(source_data, index, accessToken,secondEditDatas)
}

async function reorderReferenceData(e) {
    if((e.position == 'over') || (e.source.parentid != e.destination.parentid)) {
        e.preventDefault();
    } else {
        $('#loader-wrap').removeClass('hide')
        var temp_dataSource = $("#treelist").data("kendoTreeList").dataSource.data()
        
        var orderId = 0;
        var DestinationReached = false, SourceReached = false;
        var firstEditDatas = new Array();
        for(var i=0;i<temp_dataSource.length;i++){
            if(temp_dataSource[i].parentid == e.destination.parentid){
                var source_data = {
                    "Id":temp_dataSource[i].Id,
                    "Type": temp_dataSource[i].masterType,
                    "Code": temp_dataSource[i].Code,
                    "Name": temp_dataSource[i].Name,
                    "OrderId": temp_dataSource[i].OrderId
                }
                firstEditDatas.push(source_data)
            }
        }


        await firstEditDatas.sort( compare );
        var secondEditDatas = new Array();

        for(var i=0;i<firstEditDatas.length;i++){
            var source_data = {
                "Id":firstEditDatas[i].Id,
                "Type": firstEditDatas[i].Type,
                "Code": firstEditDatas[i].Code,
                "Name": firstEditDatas[i].Name,
                "OrderId": orderId
            }
            if(firstEditDatas[i].Id == e.destination.Id){
                if(!DestinationReached) {
                    i--;
                    DestinationReached = true;
                    source_data = {
                        "Id": e.source.Id,
                        "Type":  e.source.masterType,
                        "Code": e.source.Code,
                        "Name": e.source.Name,
                        "OrderId": orderId
                    }
                }
            } else if(firstEditDatas[i].Id == e.source.Id) {
                if(!SourceReached) {
                    SourceReached = true;
                    continue;
                }
            }
            secondEditDatas.push(source_data)
            orderId++
        }
        getTokenRedirect(loginRequest).then(response => {
            return Promise.all(secondEditDatas.map((source_data, index) => {
                patchAsync(source_data, index, response.accessToken,secondEditDatas);
            }))
        }).catch(error => {
                $('#loader-wrap').addClass('hide')
                kendo.alert("You don’t have access to EMRS Reference Data, please contact the Administrator.");
        })
    }
}

//================== MSAL Auth Block End =============

let ref_edit_data = '', ref_editting = false;

function masterTypeChange(e){
    let dataItem = this.dataItem(e.item);
    var masterName;
    if(dataItem.name != undefined){
        masterName = dataItem.name.replace(/\s/g, '').toLowerCase()
    }
    getTokenRedirect(loginRequest).then(response => {
        fetch(EMRSconfig.apiUri + '/graphql', {
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
            if(dataItem.name != undefined){
                // checkFieldExist(data.data.__type.fields)
                fetchAdditionalDataAndEdit(data.data.__type.fields,dataItem.name.toLowerCase());
            }
            for(let i=0;i<urls.length;i++){
                if(urls[i].id == dataItem.id) {
                    if(urls[i].parentid != null) {
                        $("#parent-type-wrap").append($('<div />').addClass('k-edit-label').append($('<label />').text('Parent Type')))
                            .append($('<div />').addClass('k-edit-field').append($('<input>').attr('type', 'text').attr('id', 'parent-type')))
                        for(let j=0;j<urls.length;j++){
                            if(urls[j].id == urls[i].parentid){
                                getTokenRedirect(loginRequest).then(response => {
                                    fetch(EMRSconfig.apiUri + '/referenceData/items/' + urls[j].name, {
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

function fetchAdditionalDataAndEdit(fields,masterdatatype) {
    if(ref_editting) {
        let hri = fields.find( ({ name }) => name === 'relatedincidents');
        getTokenRedirect(loginRequest).then(response => {
            fetch(EMRSconfig.apiUri + '/graphql', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                "Authorization": "Bearer " + response.accessToken
              },
              body: JSON.stringify({query:'{'+masterdatatype+'(name:"'+ref_edit_data.Name+'"){emslastsyncdatetime,vshoclastsyncdatetime,'+(hri?'relatedincidents{relatedincidentid},':'')+'createdbyuser{firstname,lastname},modifiedbyuser{firstname,lastname}}}'})
            })
            .then(response => response.json())
            .then(data => {
                checkFieldExist(fields,data,masterdatatype);
            })
        })
    }
    else {
        checkFieldExist(fields);
    }
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

function generateReferenceFields(input_type, label_text, case_text, status,additionaldata,masterdatatype){
    var readonly_ele = false
    if(USER_PERMISSION.ReferenceData != 2){
        readonly_ele = true
    }
    if(ref_editting) { 
        $("#masterType").data("kendoDropDownList").readonly();
    }
    switch (input_type) {
        case 'String':
            if(ref_editting || status) {
    if(case_text=='Polygon' || case_text=='Shape' || case_text=='rings' || case_text=='shape' || case_text=='Polygons') {
                    $("#reference-modal-content").append($('<div />').addClass('k-edit-label').append($('<label />').text(label_text)))
                    .append($('<div />').addClass('k-edit-field').append($('<textarea>').attr('readonly', readonly_ele).attr('rows', '5').attr('id', 'reference-'+case_text).addClass('k-textarea')))
                }
                else {
                    $("#reference-modal-content").append($('<div />').addClass('k-edit-label').append($('<label />').text(label_text)))
                    .append($('<div />').addClass('k-edit-field').append($('<input>').attr('readonly', readonly_ele).attr('type', 'text').attr('id', 'reference-'+case_text).addClass('k-textbox')))
                }
                if(ref_editting) {
                    if(case_text=='CreatedBy' && additionaldata.data && additionaldata.data[masterdatatype])
                        $('#reference-'+case_text).val((additionaldata.data[masterdatatype].createdbyuser && additionaldata.data[masterdatatype].createdbyuser.firstname)?additionaldata.data[masterdatatype].createdbyuser.firstname+' '+additionaldata.data[masterdatatype].createdbyuser.lastname:'');
                    else if(case_text=='ModifiedBy' && additionaldata.data && additionaldata.data[masterdatatype])
                        $('#reference-'+case_text).val((additionaldata.data[masterdatatype].modifiedbyuser && additionaldata.data[masterdatatype].modifiedbyuser.firstname)?additionaldata.data[masterdatatype].modifiedbyuser.firstname+' '+additionaldata.data[masterdatatype].modifiedbyuser.lastname:'');
                    else if(case_text=='Shape' && ref_edit_data['shape'])
                        $('#reference-'+case_text).val(ref_edit_data['shape']);
                    else
                        $('#reference-'+case_text).val(ref_edit_data[case_text]);
                }
                if(!status) {
                    $('#reference-'+case_text).attr('readonly', true);
                }
                if(case_text == 'Timezone'){
                    getTokenRedirect(loginRequest).then(response => {
                        fetch(EMRSconfig.apiUri + '/graphql', {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                            "Authorization": "Bearer " + response.accessToken
                          },
                          body: JSON.stringify({query:'{timezones(sortBy:[{field:"orderid",direction:"asc"},{field:"name",direction:"asc"}]){id,name}}'})
                        })
                        .then(response => response.json())
                        .then(data => {
                            $('#reference-'+case_text).kendoDropDownList({
                                optionLabel: "Select",
                                dataTextField: "name",
                                dataValueField: "id",
                                dataSource: data.data.timezones
                            });
                        })
                    })
                }
            }
            break;
        case 'Int':
            if(ref_editting || status) {
                if(ref_editting || case_text != 'Id') {
                    $("#reference-modal-content").append($('<div />').addClass('k-edit-label').append($('<label />').text(label_text)))
                        .append($('<div />').addClass('k-edit-field').append($('<input>').attr('readonly', readonly_ele).attr('type', 'number').attr('id', 'reference-'+case_text).addClass('k-textbox')))
                    if(case_text == 'Id') $("#reference-Id").attr('readonly', true)
                    if(ref_editting) {
                        $('#reference-'+case_text).val(ref_edit_data[case_text])
                    }
                    if(!status) {
                        $('#reference-'+case_text).attr('readonly', true)
                    }
                    if(case_text == 'IncidentSpecific'){
                        $("#reference-modal-content").append($('<div />').attr('id', 'incidentSpecific-occurrence').addClass('k-edit-field'));
                        $('#reference-'+case_text).kendoSwitch({
                            messages: {
                                checked: "YES",
                                unchecked: "NO"
                            },
                            checked:(ref_editting && ref_edit_data[case_text]==1),
                            change: function(e){
                                if(e.checked){
                                    $('#incidentSpecific-occurrence').append($('<input />').addClass('k-textbox').attr('id','incidentSpecificMultiselect'))
                                    incidentSpecific(ref_editting,ref_edit_data['RelatedIncidents']);
                                } else {
                                    $('#incidentSpecific-occurrence').empty();
                                }
                            }
                        });
                        if(ref_editting && ref_edit_data[case_text]==1) {
                            $('#incidentSpecific-occurrence').append($('<input />').addClass('k-textbox').attr('id','incidentSpecificMultiselect'));
                            incidentSpecific(ref_editting,(('relatedincidents' in additionaldata.data[masterdatatype])?additionaldata.data[masterdatatype].relatedincidents:ref_edit_data['RelatedIncidents']));
                        }
                    }
                    if(case_text == 'ApplicationId'){
                        getTokenRedirect(loginRequest).then(response => {
                            fetch(EMRSconfig.apiUri + '/graphql', {
                              method: 'POST',
                              headers: {
                                'Content-Type': 'application/json',
                                "Authorization": "Bearer " + response.accessToken
                              },
                              body: JSON.stringify({query:'{applications{id,name}}'})
                            })
                            .then(response => response.json())
                            .then(data => {
                                $('#reference-'+case_text).kendoDropDownList({
                                    optionLabel: "Select",
                                    dataTextField: "name",
                                    dataValueField: "id",
                                    dataSource: data.data.applications
                                });
                            })
                        })
                    }
                    if(case_text == 'SovereignCountryId'){
                        getTokenRedirect(loginRequest).then(response => {
                            fetch(EMRSconfig.apiUri + '/graphql', {
                              method: 'POST',
                              headers: {
                                'Content-Type': 'application/json',
                                "Authorization": "Bearer " + response.accessToken
                              },
                              body: JSON.stringify({query:'{countrys(sortBy:[{field:"orderid",direction:"asc"},{field:"name",direction:"asc"}]){id,name}}'})
                            })
                            .then(response => response.json())
                            .then(data => {
                                $('#reference-'+case_text).kendoDropDownList({
                                    optionLabel: "Select",
                                    dataTextField: "name",
                                    dataValueField: "id",
                                    dataSource: data.data.countrys
                                });
                            })
                        })
                    }
                }
            }
            break;
        case 'Boolean':
            if(ref_editting || (status && case_text!='IsActive')) {
                $("#reference-modal-content").append($('<div />').addClass('k-edit-label').append($('<label />').text(label_text)))
                    .append($('<div />').addClass('k-edit-field').append($('<input>').attr('readonly', readonly_ele).attr('type', 'checkbox').attr('id', 'reference-'+case_text).addClass('k-textbox')))
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
                    .append($('<div />').addClass('k-edit-field').append($('<input>').attr('readonly', readonly_ele).attr('id', 'reference-'+case_text).addClass('k-textbox')))
                if(ref_editting) {
                    if(case_text=='EmsLastSyncDateTime' && additionaldata.data && additionaldata.data[masterdatatype])
                        $('#reference-'+case_text).val(additionaldata.data[masterdatatype].emslastsyncdatetime?additionaldata.data[masterdatatype].emslastsyncdatetime:'');
                    else if(case_text=='vShocLastSyncDateTime' && additionaldata.data && additionaldata.data[masterdatatype])
                        $('#reference-'+case_text).val(additionaldata.data[masterdatatype].vshoclastsyncdatetime?additionaldata.data[masterdatatype].vshoclastsyncdatetime:'');
                    else
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

function incidentSpecific(editing,currentvalues){
    let curvalsasarray = [];
    if(editing && currentvalues && !Array.isArray(currentvalues)) {
        currentvalues=currentvalues.replace(/^\[+|\]+$/g, '');
        curvalsasarray = currentvalues.split(',');
    }
    else if(editing && Array.isArray(currentvalues)) {
        for(var x=0;x<currentvalues.length;x++)
            curvalsasarray.push(currentvalues[x].relatedincidentid);
    }
    getTokenRedirect(loginRequest).then(response => {
        fetch(EMRSconfig.apiUri + '/graphql', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            "Authorization": "Bearer " + response.accessToken
          },
          body: JSON.stringify({query:'{occurrences(occurrencetype:2){sourcereferenceid,occurrencename}}'})
        })
        .then(response => response.json())
        .then(data => {
            $('#incidentSpecific-occurrence>input').kendoMultiSelect({
                autoClose: false,
                dataTextField: "occurrencename",
                dataValueField: "sourcereferenceid",
                dataSource: data.data.occurrences,
                value:curvalsasarray
            });
        })
    })
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
        ref_post_val.Type = parseInt($("#masterType").data("kendoDropDownList").value());
        field_order.map((field_detail) => {
        if(field_detail.request) {
                var ref_modal_ele = $('#reference-' + field_detail.fieldname)
                if(ref_modal_ele.length > 0){
                    if(ref_modal_ele.attr('type') == 'checkbox') {
                        if(field_detail.fieldname=='IncidentSpecific')
                            ref_post_val[field_detail.fieldname] = ref_modal_ele.get(0).checked?1:0;
                        else
                            ref_post_val[field_detail.fieldname] = ref_modal_ele.get(0).checked
                    } else if(ref_modal_ele.attr('type') == 'number'){
                        if(ref_modal_ele.val() != '')
                            ref_post_val[field_detail.fieldname] = parseInt(ref_modal_ele.val())
                    } else {
                        if(ref_modal_ele.val() != '')
                            ref_post_val[field_detail.fieldname] = ref_modal_ele.val();
                    }
                }
            }
        })
        if ('IncidentSpecific' in ref_post_val && ref_post_val.IncidentSpecific==1)
        {
            let selectincidents = $("#incidentSpecificMultiselect").data("kendoMultiSelect").dataItems();
            let selectedData=[];
            if(selectincidents.length==0)
            {
                $('.k-error-msg').html('If Incident Specific=Yes, at least one Emergency should be selected under Incident Specific');
                return;
            }
            else {
                for (var i=0;i<selectincidents.length;i++)
                {
                   selectedData.push(selectincidents[i].sourcereferenceid);
                }
                ref_post_val.relatedIncidents=selectedData;
            }
        }

        if($('#parent-type').length > 0) {
            ref_post_val[$('#parent-type-name').val() + 'Id'] = parseInt($("#parent-type").data("kendoDropDownList").value());
        }

        $('#loader-wrap').removeClass('hide');
        getTokenRedirect(loginRequest).then(response => {
            $.ajax({
                url: EMRSconfig.apiUri + '/referenceData/items',
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
                    $('#loader-wrap').addClass('hide');
                    if(data.value) {
                        var newElement = {};
                        for (const [key, value] of Object.entries(data.value)) {
                            newElement[key] = value
                        }
                        var masterDetails;

                        for(var i=0;i<urls.length;i++){
                            if(urls[i].id == ref_post_val.Type){
                                masterDetails = urls[i];
                                break;
                            }
                        }
                        console.log(masterDetails, ref_post_val.Type)
                        if(masterDetails.parentid == null) {
                            newElement.parentid = ref_post_val.Type
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
                        newElement.masterName = masterDetails.Name
                        
                        referenceDatas.push(newElement)
                        $("#treelist").data("kendoTreeList").dataSource.pushCreate(newElement);
                        $("#treelist").data("kendoTreeList").refresh();
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
                    $('#loader-wrap').addClass('hide');
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
            if(field_detail.request || field_detail.fieldname=='IsActive') {
                var ref_modal_ele = $('#reference-' + field_detail.fieldname)
                if(ref_modal_ele.length > 0){
                    if(ref_modal_ele.attr('type') == 'checkbox') {
                        if(field_detail.fieldname=='IncidentSpecific')
                            ref_post_val[field_detail.fieldname] = ref_modal_ele.get(0).checked?1:0;
                        else
                            ref_post_val[field_detail.fieldname] = ref_modal_ele.get(0).checked
                    } else if(ref_modal_ele.attr('type') == 'number'){
                         if(ref_modal_ele.val() != '')
                            ref_post_val[field_detail.fieldname] = parseInt(ref_modal_ele.val())
                    } else {
                            ref_post_val[field_detail.fieldname] = ref_modal_ele.val();
                    }
                }
            }
        })
        if ('IncidentSpecific' in ref_post_val && ref_post_val.IncidentSpecific==1)
        {
            let selectincidents = $("#incidentSpecificMultiselect").data("kendoMultiSelect").dataItems();
            let selectedData=[];
            if(selectincidents.length==0)
            {
                $('.k-error-msg').html('If Incident Specific=Yes, at least one Emergency should be selected under Incident Specific');
                return;
            }
            else {
                for (var i=0;i<selectincidents.length;i++)
                {
                   selectedData.push(selectincidents[i].sourcereferenceid);
                }
                ref_post_val.relatedIncidents=selectedData;
            }
        }
        if($('#parent-type').length > 0) {
            ref_post_val[$('#parent-type-name').val() + 'Id'] = parseInt($("#parent-type").data("kendoDropDownList").value());
        }
        ref_post_val.Type = parseInt($("#masterType").data("kendoDropDownList").value());
        getTokenRedirect(loginRequest).then(response => {
            $.ajax({
                url: EMRSconfig.apiUri + '/referenceData/items',
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
                    if(!data.error) {
                        for(var key in ref_post_val) {
                            var value = ref_post_val[key];
                            updatedElement[key] = value
                        }
                        for(var i=0;i<urls.length;i++){
                            if(urls[i].id == updatedElement.masterType){
                                if(urls[i].parentid != null){
                                    for(var j=0;j<urls.length;j++){
                                        if(urls[i].parentid == urls[j].id){
                                            updatedElement.parentid = urls[j].id * 10000 + updatedElement[urls[j].name + 'Id']
                                            break;
                                        }
                                    }
                                }
                                break;
                            }
                        }
                        updatedElement.ModifiedBy = data.value.ModifiedBy;
                        updatedElement.ModifiedDate = data.value.ModifiedDate;
                        referenceDatas[ref_edit_num] = updatedElement
                        $("#treelist").data("kendoTreeList").dataSource.pushUpdate(updatedElement);
                        $("#treelist").data("kendoTreeList").refresh();
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
    if(USER_PERMISSION.SystemPermission == 2) {
        $(ele).parent().parent().remove()
    }
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
        // height: 550,
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
                    if(USER_PERMISSION.DocumentPermission == 2){
                        buttons += '<button class="k-button k-button-icontext doc-app-edt"><span class="k-icon k-i-edit"></span>Edit</button>';
                    
                        buttons += '<button class="k-button k-button-icontext doc-app-delete"><span class="k-icon k-i-close"></span>Delete</button>';
                    }else{
                        buttons += '<button class="k-button k-button-icontext doc-app-edt"><span class="k-icon k-i-edit"></span>View</button>';
                    }
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
        // height: 550,
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
                    if(USER_PERMISSION.SystemPermission == 2) {
                        buttons += '<button class="k-button k-button-icontext sys-app-edt"><span class="k-icon k-i-edit"></span>Edit</button>';
                    
                        buttons += '<button class="k-button k-button-icontext sys-app-delete"><span class="k-icon k-i-close"></span>Delete</button>';
                    } else {
                        buttons += '<button class="k-button k-button-icontext sys-app-edt"><span class="k-icon k-i-edit"></span>View</button>';
                    }
                    
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
    referenceDataTabOpen = false
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

function generateMembershipGrid() {
    $("#user-membership-grid").kendoGrid({
        dataSource: {
            data: membershipDatas,
            schema: {
                model: {
                    id: "userid",
                    fields: {
                        userid: { editable: false, nullable: true },
                        emailaddress: { type: "string", editable: true },
                        firstname: { type: "string", editable: true },
                        lastname: { type: "string", editable: true },
                        orgpath: { type: "string" },
                        region: {
                            defaultValue:{
                                name: "KLJH"
                            },
                            nullable: true
                        },
                        country: {
                            name: "Switzerland"
                        },
                        locationtype: {
                            name: "Country Office"
                        },
                        internalexternal: {
                            name: "Internal"
                        },
                        agency: { type: "string" },
                    }
                }
            },
            batch: true,
            pageSize: 15
        },
        // toolbar: kendo.template($("#doc-toolbar-template").html()),
        // height: 550,
        scrollable: true,
        sortable: true,
        sort: user_membership_sort,
        filterable: {
            operators: {
                string: {
                    contains: "Contains"
                }
            },
            extra: false
        },
        filter: user_membership_filter,
        // editable: "inline",
        columns: [
            { field: "userid", title: "UserID" },
            { field: "emailaddress", title: "E-mail" },
            { field: "firstname", title: "First Name" },
            { field: "lastname", title: "Last Name" },
            { field: "orgpath", title: "Org Path" },
            { field: 'region.name', title: "Region" },
            { field: 'country.name', title: "Country" },
            { field: 'locationtype.name', title: "Location Type" },
            { field: 'internalexternal.name', title: "Internal or External", editor: clientCategoryEditor },
            { field: "agency", title: "Agency" },
            { template: '<input type="checkbox">', title: "Group Member" },
            {
                command: ["edit"],
                title: "Options ",
                width: "100px"
            },
            // {
            //     title: 'Actions',
            //     template: function (dataItem) {
            //         let buttons = '<div>';
            //         if((USER_PERMISSION.GroupMembership == 2) || (USER_PERMISSION.GroupMembership == 4)){
            //             buttons += '<button class="k-button k-button-icontext doc-app-edt"><span class="k-icon k-i-edit"></span>Edit</button>';
                    
            //             buttons += '<button class="k-button k-button-icontext doc-app-delete"><span class="k-icon k-i-close"></span>Delete</button>';
            //         }else{
            //             buttons += '<button class="k-button k-button-icontext doc-app-edt"><span class="k-icon k-i-edit"></span>View</button>';
            //         }
            //         buttons += '</div>';
            //         return buttons;
            //     },
            //     width: 200 
            // }
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

function user_membership_sort(e) {
    $('#loader-wrap').removeClass('hide')
    var sort_field = 'lastname', sort_dir = 'asc';
    var user_membership_grid = $("#user-membership-grid").data("kendoGrid").dataSource
    var currentSorts = user_membership_grid.sort()
    if(currentSorts && currentSorts.length > 0) {
        var currentSort = currentSorts[0]
        sort_field = currentSort.field
        sort_dir = currentSort.dir
    }
    var page_num = membership_pager.pageSize()
    var page_start_num = 0
    membership_pager.page(1)
    membership_fetch_data = '{users(limitItems:' + page_num.toString() + ',offset:' + page_start_num.toString() + ',sortBy:{field:"' + sort_field + '",direction:"' + sort_dir + '"}' + membership_fetch_data_end
    user_membership_page_update()
}

function user_membership_filter(e) {
    $('#loader-wrap').removeClass('hide')
    var filter_field = '', filter_value = '', sort_field = '', sort_dir = '';
    $('#usermembership-search-input').val('')
    var user_membership_grid = $("#user-membership-grid").data("kendoGrid").dataSource
    var currentSorts = user_membership_grid.sort()
    if(currentSorts && currentSorts.length > 0) {
        var currentSort = currentSorts[0]
        sort_field = currentSort.field
        sort_dir = currentSort.dir
    }
    user_membership_grid.filter({})
    if (e.filter == null) {
        console.log("filter has been cleared");
    } else {
        filter_field = e.filter.filters[0].field
        filter_value = e.filter.filters[0].value
    }
    var page_num = membership_pager.pageSize()
    var page_start_num = 0
    membership_pager.page(1)
    user_membership_query_update(filter_field, filter_value, sort_field, sort_dir, page_start_num, page_num)
}

var categories;
function clientCategoryEditor(container, options) {
    console.log('aaaaaaaaaaaaaaaaaaa')
    $('<input required name="Category">')
        .appendTo(container)
        .kendoDropDownList({
            autoBind: false,
            dataTextField: "name",
            dataValueField: "id",
            dataSource: {
                data: categories
            }
        });
}

function user_membership_query_update(filter_field, filter_value, sort_field, sort_dir, page_start_num, page_num){
    var special_filter_items = ['region.name', 'country.name', 'locationtype.name', 'internalexternal.name']
    if(!(filter_value || sort_dir)) {
        membership_fetch_data = '{users(limitItems:' + page_num.toString() + ',offset:' + page_start_num.toString() + ',sortBy:{field:"lastname",direction:"asc"}){userid,emailaddress,firstname,lastname,orgpath,region{name},country{name},locationtype{name},internalexternal{name},agency,groupmemberships{group{groupid}}}}'
        membership_fetch_data_end = '){userid,emailaddress,firstname,lastname,orgpath,region{name},country{name},locationtype{name},internalexternal{name},agency,groupmemberships{group{groupid}}}}'
        user_membership_page_update()
    } else if(!filter_value) {
        membership_fetch_data = '{users(limitItems:' + page_num.toString() + ',offset:' + page_start_num.toString() + ',sortBy:{field:"' + sort_field + '",direction:"' + sort_dir + '"}){userid,emailaddress,firstname,lastname,orgpath,region{name},country{name},locationtype{name},internalexternal{name},agency,groupmemberships{group{groupid}}}}'
        membership_fetch_data_end = '){userid,emailaddress,firstname,lastname,orgpath,region{name},country{name},locationtype{name},internalexternal{name},agency,groupmemberships{group{groupid}}}}'
        user_membership_page_update()
    } else if(!sort_dir) {
        if(special_filter_items.includes(filter_field)) {
            var filter_item_string = filter_field.split('.')[0]
            var filter_items_string = filter_item_string + 's'
            var first_filter_query = '{' + filter_items_string + '(filter:"name like \'%' + filter_value + '%\'") {id}}'
            getTokenRedirect(loginRequest).then(response => {
                fetch(EMRSconfig.apiUri + '/graphql', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    "Authorization": "Bearer " + response.accessToken
                  },
                  body: JSON.stringify({query:first_filter_query})
                })
                .then(response => response.json())
                .then(data => {
                    var filter_item_values = data.data[filter_items_string]
                    var filter_item_ids = []
                    if(filter_item_values && filter_item_values.length > 0) {
                        filter_item_values.map((filter_item_value) => {
                            filter_item_ids.push(filter_item_value.id)
                        })
                        membership_fetch_data = '{users(limitItems:' + page_num.toString() + ',offset:' + page_start_num.toString() + ',sortBy:{field:"lastname",direction:"asc"},filter:"' + filter_item_string + 'id in \\\"' + filter_item_ids.join(',') + '\\\":int32[]"){userid,emailaddress,firstname,lastname,orgpath,region{name},country{name},locationtype{name},internalexternal{name},agency,groupmemberships{group{groupid}}}}'
                        membership_fetch_data_end = ',filter:"' + filter_item_string + 'id in \\\"' + filter_item_ids.join(',') + '\\\":int32[]"){userid,emailaddress,firstname,lastname,orgpath,region{name},country{name},locationtype{name},internalexternal{name},agency,groupmemberships{group{groupid}}}}'
                        user_membership_page_update()
                    }
                })
            }).catch(error => {
                $('#loader-wrap').addClass('hide')
                console.log(error)
                kendo.alert("You don’t have access to EMRS Reference Data, please contact the Administrator.");
            });
        } else {
            membership_fetch_data = '{users(limitItems:' + page_num.toString() + ',offset:' + page_start_num.toString() + ',sortBy:{field:"lastname",direction:"asc"},filter:"' + filter_field + ' like \\\"%' + filter_value + '%\\\":string"){userid,emailaddress,firstname,lastname,orgpath,region{name},country{name},locationtype{name},internalexternal{name},agency,groupmemberships{group{groupid}}}}'
            membership_fetch_data_end = ',filter:"' + filter_field + ' like \\\"%' + filter_value + '%\\\":string"){userid,emailaddress,firstname,lastname,orgpath,region{name},country{name},locationtype{name},internalexternal{name},agency,groupmemberships{group{groupid}}}}'
            user_membership_page_update()
        }
    } else {
        if(special_filter_items.includes(filter_field)) {
            var filter_item_string = filter_field.split('.')[0]
            var filter_items_string = filter_item_string + 's'
            var first_filter_query = '{' + filter_items_string + '(filter:"name like \'%' + filter_value + '%\'") {id}}'
            getTokenRedirect(loginRequest).then(response => {
                fetch(EMRSconfig.apiUri + '/graphql', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    "Authorization": "Bearer " + response.accessToken
                  },
                  body: JSON.stringify({query:first_filter_query})
                })
                .then(response => response.json())
                .then(data => {
                    var filter_item_values = data.data[filter_items_string]
                    var filter_item_ids = []
                    if(filter_item_values && filter_item_values.length > 0) {
                        filter_item_values.map((filter_item_value) => {
                            filter_item_ids.push(filter_item_value.id)
                        })
                        membership_fetch_data = '{users(limitItems:' + page_num.toString() + ',offset:' + page_start_num.toString() + ',sortBy:{field:"' + sort_field + '",direction:"' + sort_dir + '"},filter:"' + filter_item_string + 'id in \\\"' + filter_item_ids.join(',') + '\\\":int32[]"){userid,emailaddress,firstname,lastname,orgpath,region{name},country{name},locationtype{name},internalexternal{name},agency,groupmemberships{group{groupid}}}}'
                        membership_fetch_data_end = ',filter:"' + filter_item_string + 'id in \\\"' + filter_item_ids.join(',') + '\\\":int32[]"){userid,emailaddress,firstname,lastname,orgpath,region{name},country{name},locationtype{name},internalexternal{name},agency,groupmemberships{group{groupid}}}}'
                        user_membership_page_update()
                    }
                })
            }).catch(error => {
                $('#loader-wrap').addClass('hide')
                console.log(error)
                kendo.alert("You don’t have access to EMRS Reference Data, please contact the Administrator.");
            });
        } else {
            membership_fetch_data = '{users(limitItems:' + page_num.toString() + ',offset:' + page_start_num.toString() + ',sortBy:{field:"' + sort_field + '",direction:"' + sort_dir + '"},filter:"' + filter_field + ' like \\\"%' + filter_value + '%\\\":string"){userid,emailaddress,firstname,lastname,orgpath,region{name},country{name},locationtype{name},internalexternal{name},agency,groupmemberships{group{groupid}}}}'
            membership_fetch_data_end = ',filter:"' + filter_field + ' like \\\"%' + filter_value + '%\\\":string"){userid,emailaddress,firstname,lastname,orgpath,region{name},country{name},locationtype{name},internalexternal{name},agency,groupmemberships{group{groupid}}}}'
            user_membership_page_update()
        }
    }
}

function user_membership_page_update() {
    // $('#loader-wrap').removeClass('hide')
    getTokenRedirect(loginRequest).then(response => {
        fetch(EMRSconfig.apiUri + '/graphql', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            "Authorization": "Bearer " + response.accessToken
          },
          body: JSON.stringify({query:membership_fetch_data})
        })
        .then(response => response.json())
        .then(data => {
            membershipDatas = data.data.users
            membershipDatas.map((membershipData, index) => {
                if(membershipData.region == null){
                    membershipData.region = {
                        name: null
                    }
                }
                if(membershipData.country == null){
                    membershipData.country = {
                        name: null
                    }
                }
                if(membershipData.locationtype == null){
                    membershipData.locationtype = {
                        name: null
                    }
                }
                if(membershipData.internalexternal == null){
                    membershipData.internalexternal = {
                        name: null
                    }
                }
            })
            var user_membership_grid = $("#user-membership-grid").data("kendoGrid")
            user_membership_grid.dataSource.data(membershipDatas)
            user_membership_grid.dataSource.page(1);
            $('#loader-wrap').addClass('hide')
        })
    }).catch(error => {
        $('#loader-wrap').addClass('hide')
        console.log(error)
        kendo.alert("You don’t have access to EMRS Reference Data, please contact the Administrator.");
    });
}

$(document).ready(function() {
    var tabToDeactivate = $("#reference-tab");
    $("#tabstrip").kendoTabStrip().data("kendoTabStrip").deactivateTab(tabToDeactivate);
    $("#tabstrip").kendoTabStrip({
        animation:  {
            open: {
                effects: "fadeIn"
            }
        }
    }).data("kendoTabStrip").deactivateTab(tabToDeactivate);
    $('li[role=tab]').on('click', () => {
        $('#select-tab').hide()
    })
    $("#reference-tab").on('click', () => {
        if(referenceDataTabOpen){
            if(USER_PERMISSION.ReferenceData != 0){
                $('#loader-wrap').removeClass('hide')
                fetchMasterType()
            } else {
                $('#reference-blue-bar').text('No Administrator groups are assigned to you');
            }
        }
    })
    $('#tabstrip-tab-3').on('click', () => {
        if(documentPermissionTabOpen) {
            if(USER_PERMISSION.DocumentPermission != 0){
                $('#loader-wrap').removeClass('hide')
                getTokenRedirect(loginRequest).then(response => {
                    fetch(EMRSconfig.apiUri + '/graphql', {
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
                    fetch(EMRSconfig.apiUri + '/permissions/rules/' + 'document', {
                      method: 'GET',
                      headers: {
                        'Content-Type': 'application/json',
                        "Authorization": "Bearer " + response.accessToken
                      },
                    })
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
            } else {
                $('#document-blue-bar').text('No Administrator groups are assigned to you');
            }
        }
    })

    $('#tabstrip-tab-2').on('click', () => {
        if(sysPermissionTabOpen) {
            if(USER_PERMISSION.SystemPermission != 0){
                $('#loader-wrap').removeClass('hide')
                getTokenRedirect(loginRequest).then(response => {
                    fetch(EMRSconfig.apiUri + '/graphql', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                        "Authorization": "Bearer " + response.accessToken
                      },
                      body: JSON.stringify({query:sys_fetch_body})
                    })
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
            } else {
                $('#system-blue-bar').text('No Administrator groups are assigned to you');
            }
        }
    })

    $('#tabstrip-tab-4').on('click', () => {
        if(permissionSimulationTabOpen){
            if(USER_PERMISSION.UserPermissionSimulation != 0){
                $('#loader-wrap').removeClass('hide')
                getTokenRedirect(loginRequest).then(response => {
                    var token_response = response
                    fetch(EMRSconfig.apiUri + '/graphql', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                        "Authorization": "Bearer " + response.accessToken
                      },
                      body: JSON.stringify({query:'{user(emailaddress:"' + username + '"){userid}}'})
                    })
                    .then(response => response.json())
                    .then(data => {
                        var user_id = data.data.user.userid
                        fetch(EMRSconfig.apiUri + '/users/' + user_id + '/permissions', {
                          method: 'GET',
                          headers: {
                            'Content-Type': 'application/json',
                            "Authorization": "Bearer " + response.accessToken
                          }
                        })
                        .then(response => response.json())
                        .then(data => {
                        })
                    })
                })
                var simulate_json = applied_permissions.data
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

                var specific_user_ds = new kendo.data.DataSource({
                    data: specific_user.data.users
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

                var simul_path = './simulate_json/'
                var simul_dataSource = new kendo.data.DataSource({
                    data: simulated_user.data.users,
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
                permissionSimulationTabOpen = false;
                $('#loader-wrap').addClass('hide')
            } else {
                $('#simulation-blue-bar').text('No Administrator groups are assigned to you');
                $('#user-simulation').css('display', 'none')
            }
        }

    })
    
    $("#membership-tab").on('click', () => {
        if(userMembershipTabOpen){
            if(USER_PERMISSION.GroupMembership != 0){
                $('#loader-wrap').removeClass('hide')
                getTokenRedirect(loginRequest).then(response => {
                    var token_response = response

                    fetch(EMRSconfig.apiUri + '/graphql', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                        "Authorization": "Bearer " + token_response.accessToken
                      },
                      body: JSON.stringify({query:membership_length_fetch_data})
                    })
                    .then(response => response.json())
                    .then(data => {
                        MEMBERSHIP_LENGTH = data.data.users[0].aggregate_count
                        var user_membership_temp_data = new Array(MEMBERSHIP_LENGTH)
                        for(var i=0;i<user_membership_temp_data.length;i++){
                            user_membership_temp_data[i] = ''
                        }
                        var user_membership_temp_dataSource = new kendo.data.DataSource({
                            data: user_membership_temp_data,
                            pageSize: 15
                        });

                        user_membership_temp_dataSource.read();
                        membership_pager = $("#user-membership-pager").kendoPager({
                            dataSource: user_membership_temp_dataSource,
                            change: function(){
                                $('#loader-wrap').removeClass('hide')
                                var sort_field = 'lastname', sort_dir = 'asc';
                                var user_membership_grid = $("#user-membership-grid").data("kendoGrid").dataSource
                                var currentSorts = user_membership_grid.sort()
                                if(currentSorts && currentSorts.length > 0) {
                                    var currentSort = currentSorts[0]
                                    sort_field = currentSort.field
                                    sort_dir = currentSort.dir
                                }
                                let page_num = membership_pager.pageSize()
                                let page_start_num = (membership_pager.page() - 1) * membership_pager.pageSize()
                                membership_fetch_data = '{users(limitItems:' + page_num.toString() + ',offset:' + page_start_num.toString() + ',sortBy:{field:"' + sort_field + '",direction:"' + sort_dir + '"}' + membership_fetch_data_end
                                user_membership_page_update()
                            }
                        }).data("kendoPager");
                    })

                    fetch(EMRSconfig.apiUri + '/graphql', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                        "Authorization": "Bearer " + token_response.accessToken
                      },
                      body: JSON.stringify({query:membership_fetch_data})
                    })
                    .then(response => response.json())
                    .then(data => {
                        membershipDatas = data.data.users
                        membershipDatas.map((membershipData, index) => {
                            if(membershipData.region == null){
                                membershipData.region = {
                                    name: null
                                }
                            }
                            if(membershipData.country == null){
                                membershipData.country = {
                                    name: null
                                }
                            }
                            if(membershipData.locationtype == null){
                                membershipData.locationtype = {
                                    name: null
                                }
                            }
                            if(membershipData.internalexternal == null){
                                membershipData.internalexternal = {
                                    name: null
                                }
                            }
                        })
                        generateMembershipGrid()
                    })

                    fetch(EMRSconfig.apiUri + '/graphql', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                        "Authorization": "Bearer " + token_response.accessToken
                      },
                      body: JSON.stringify({query:'{countrys{id, name}}'})
                    })
                    .then(response => response.json())
                    .then(data => {
                        categories = data.data.countrys
                    })

                    fetch(EMRSconfig.apiUri + '/graphql', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                        "Authorization": "Bearer " + token_response.accessToken
                      },
                      body: JSON.stringify({query:'{groups(sortBy:{field:"groupname",direction:"asc"}){groupid,groupname}}'})
                    })
                    .then(response => response.json())
                    .then(data => {
                        $('#group-membership').kendoDropDownList({
                            optionLabel: "Select Group",
                            dataTextField: "groupname",
                            dataValueField: "groupid",
                            dataSource: data.data.groups
                        })
                        $('#loader-wrap').addClass('hide')
                    })
                })
            } else {
                $('#user-membership').hide()
                $('#membership-blue-bar').text('No Administrator groups are assigned to you');
            }
        }
    })

    $("#usermembership-search-btn").on('click', function(){
        $('#loader-wrap').removeClass('hide')
        var search_string = $("#usermembership-search-input").val()
        var filter_field = '', filter_value = '', sort_field = 'lastname', sort_dir = 'asc';
        var user_membership_grid = $("#user-membership-grid").data("kendoGrid").dataSource
        var currentSorts = user_membership_grid.sort()
        if(currentSorts && currentSorts.length > 0) {
            var currentSort = currentSorts[0]
            sort_field = currentSort.field
            sort_dir = currentSort.dir
        }
        user_membership_grid.filter({})
        var page_num = membership_pager.pageSize()
        var page_start_num = 0
        membership_pager.page(1);
        if(search_string) {
            var [region_filter_string, country_filter_string, locationtype_filter_string, inexternal_filter_string] = ['', '', '', '']
            var first_filter_query = '{' +
                    'regions(filter:"name like \'%' + search_string + '%\'"){id}' +
                    'countrys(filter:"name like \'%' + search_string + '%\'"){id}' +
                    'locationtypes(filter:"name like \'%' + search_string + '%\'"){id}' +
                    'internalexternals(filter:"name like \'%' + search_string + '%\'"){id}' +
                '}'
            getTokenRedirect(loginRequest).then(response => {
                fetch(EMRSconfig.apiUri + '/graphql', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    "Authorization": "Bearer " + response.accessToken
                  },
                  body: JSON.stringify({query:first_filter_query})
                })
                .then(response => response.json())
                .then(data => {
                    if(data.data.regions.length > 0) {
                        var temp_data = []
                        data.data.regions.map((region_field) => {
                            temp_data.push(region_field.id)
                        })
                        region_filter_string = 'regionid in \\\"' + temp_data.join(',') + '\\\":int32[] OR '
                    }
                    if(data.data.countrys.length > 0) {
                        var temp_data = []
                        data.data.countrys.map((country_field) => {
                            temp_data.push(country_field.id)
                        })
                        country_filter_string = 'countryid in \\\"' + temp_data.join(',') + '\\\":int32[] OR '
                    }
                    if(data.data.locationtypes.length > 0) {
                        var temp_data = []
                        data.data.locationtypes.map((locationtype_field) => {
                            temp_data.push(locationtype_field.id)
                        })
                        locationtype_filter_string = 'locationtypeid in \\\"' + temp_data.join(',') + '\\\":int32[] OR '
                    }
                    if(data.data.internalexternals.length > 0) {
                        var temp_data = []
                        data.data.internalexternals.map((internalexternal_field) => {
                            temp_data.push(internalexternal_field.id)
                        })
                        inexternal_filter_string = 'internalexternalid in \\\"' + temp_data.join(',') + '\\\":int32[] OR '
                    }
                    membership_fetch_data = '{users(limitItems:' + page_num.toString() + ',offset:0,sortBy:{field:"' + sort_field + '",direction:"' + sort_dir + '"},filter:"' +
                        region_filter_string + country_filter_string + locationtype_filter_string + inexternal_filter_string +
                        'emailaddress like \\\"%' + search_string + '%\\\":string OR ' +
                        'firstname like \\\"%' + search_string + '%\\\":string OR ' +
                        'lastname like \\\"%' + search_string + '%\\\": string OR ' +
                        'orgpath like \\\"%' + search_string + '%\\\" string OR ' +
                        'agency like \\\"%' + search_string + '%\\\":string")' +
                        '{userid,emailaddress,firstname,lastname,orgpath,region{name},country{name},locationtype{name},internalexternal{name},agency,groupmemberships{group{groupid}}}}'
                    membership_fetch_data_end = ',filter:"' +
                        region_filter_string + country_filter_string + locationtype_filter_string + inexternal_filter_string +
                        'emailaddress like \\\"%' + search_string + '%\\\":string OR ' +
                        'firstname like \\\"%' + search_string + '%\\\":string OR ' +
                        'lastname like \\\"%' + search_string + '%\\\": string OR ' +
                        'orgpath like \\\"%' + search_string + '%\\\" string OR ' +
                        'agency like \\\"%' + search_string + '%\\\":string")' +
                        '{userid,emailaddress,firstname,lastname,orgpath,region{name},country{name},locationtype{name},internalexternal{name},agency,groupmemberships{group{groupid}}}}'
                    user_membership_page_update()
                })
            }).catch(error => {
                $('#loader-wrap').addClass('hide')
                console.log(error)
                kendo.alert("You don’t have access to EMRS Reference Data, please contact the Administrator.");
            });
        } else {
            membership_fetch_data = '{users(limitItems:' + page_num.toString() + ',offset:' + page_start_num.toString() + ',sortBy:{field:"' + sort_field + '",direction:"' + sort_dir + '"}){userid,emailaddress,firstname,lastname,orgpath,region{name},country{name},locationtype{name},internalexternal{name},agency,groupmemberships{group{groupid}}}}'
            membership_fetch_data_end = '){userid,emailaddress,firstname,lastname,orgpath,region{name},country{name},locationtype{name},internalexternal{name},agency,groupmemberships{group{groupid}}}}'
            user_membership_page_update()
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
                $("#sys-hidden-id").val(sys_pop_edit_dataSource.id)
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

                var readonly_ele = false;
                if(USER_PERMISSION.SystemPermission != 2) {
                    readonly_ele = true;
                }

                for(var i=1;i<sys_pop_edit_dataSource.ruledefination.ifCondition.length;i++) {
                    first_slt_id = sys_pop_edit_dataSource.ruledefination.ifCondition[i].userAttribute.id;
                    let condition_wrap = $('#ifCondition-wrap')
                    condition_wrap.append($('<div />').attr('class', 'full-flex flex-center d-flex')
                        .append($('<input />').addClass('ifCondition').attr('readonly', readonly_ele))
                        .append($('<input />').addClass('ifOperator').attr('readonly', readonly_ele))
                        .append($('<input />').addClass('ifCountry').attr('disabled', 'disabled').attr('readonly', readonly_ele))
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
            edited_sys_permission.id = '00000000-0000-0000-0000-000000000000'
            edited_sys_permission.type = 'User'
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
                var second_slt_type = 'freetext', second_slt_key = '';
                for(var j=0;j<sysPermissionDatas.attributeoperatormappings.length;j++){
                    if(sysPermissionDatas.attributeoperatormappings[j].attributeid == ifCondition_val.userAttribute.id) {
                        second_slt_type = sysPermissionDatas.attributeoperatormappings[j].valuetype
                        if(second_slt_type != 'freetext') {
                            ifCondition_val.value.id = $(ifCondition_wrap_rows[i]).find('input.ifCountry').data("kendoDropDownList").value()
                            ifCondition_val.value.name = $(ifCondition_wrap_rows[i]).find('input.ifCountry').data("kendoDropDownList").text()
                        } else {
                            ifCondition_val.value.id = $(ifCondition_wrap_rows[i]).find('input.ifCountry').val()
                            ifCondition_val.value.name = $(ifCondition_wrap_rows[i]).find('input.ifCountry').val()
                        }
                        edited_sys_permission.ruledefination.ifCondition.push(ifCondition_val)
                        break;
                    }
                }
                
            
                
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

            var add_sys_permission = {};
            add_sys_permission.Id = edited_sys_permission.id;
            add_sys_permission.type = edited_sys_permission.type;
            add_sys_permission.ApplicationId = Number(edited_sys_permission.application.id);
            add_sys_permission.Status = edited_sys_permission.status;
            add_sys_permission.Name = edited_sys_permission.name;
            add_sys_permission.Description = edited_sys_permission.description;
            add_sys_permission.RuleDefination = {};
            add_sys_permission.RuleDefination.IfCondition = new Array();
            edited_sys_permission.ruledefination.ifCondition.map((ifcondition) => {
                var temp_ifcondition = {
                    "UserAttribute":Number(ifcondition.userAttribute.id),
                    "Operator": Number(ifcondition.operator.id),
                    "Value": ifcondition.value.id.toString()
                }
                add_sys_permission.RuleDefination.IfCondition.push(temp_ifcondition)
            })
            add_sys_permission.RuleDefination.ThenCondition = {};
            var temp_thencondition = {
                "Permission": Number(edited_sys_permission.ruledefination.thenCondition[0].permission.id),
                "Value": edited_sys_permission.ruledefination.thenCondition[0].value.id.toString()
            }
            add_sys_permission.RuleDefination.ThenCondition = temp_thencondition

            if(key == 'edit') {
                // sPermission_data[row.index()] = edited_sys_permission
                add_sys_permission.Id = $("#sys-hidden-id").val()
                console.log(add_sys_permission, edited_sys_permission)

                getTokenRedirect(loginRequest).then(response => {
                    fetch(EMRSconfig.apiUri + '/permissions/rules', {
                      method: 'PATCH',
                      headers: {
                        'Content-Type': 'application/json',
                        "Authorization": "Bearer " + response.accessToken
                      },
                      body: JSON.stringify(add_sys_permission)
                      // body: '{"type":"User","Name":"BRR1 and OPP1 can update EMS2","Description":"Testing uer permissions","ApplicationId":2,"Status":true,"RuleDefination":{"IfCondition":[{"UserAttribute":2,"Operator":1,"Value":"BRR1"},{"UserAttribute":2,"Operator":1,"Value":"OPP1"}],"ThenCondition":{"Permission":3,"Value":"6"}},"Id":"00000000-0000-0000-0000-000000000000"}'
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
                            edited_sys_permission.id = $("#sys-hidden-id").val()
                            sPermission_data[row.index()] = edited_sys_permission
                            $("#system-permission").data("kendoGrid").dataSource.read();
                            doc_pop.data("kendoWindow").close()
                        }
                    }).catch((error) => {
                        console.log(error)
                    });
                    
                }).catch(error => {
                    kendo.alert("You don’t have access to EMRS Reference Data, please contact the Administrator.");
                });
            } else {
                
                console.log(add_sys_permission, edited_sys_permission)

                getTokenRedirect(loginRequest).then(response => {
                    fetch(EMRSconfig.apiUri + '/permissions/rules', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                        "Authorization": "Bearer " + response.accessToken
                      },
                      body: JSON.stringify(add_sys_permission)
                      // body: '{"type":"User","Name":"BRR1 and OPP1 can update EMS2","Description":"Testing uer permissions","ApplicationId":2,"Status":true,"RuleDefination":{"IfCondition":[{"UserAttribute":2,"Operator":1,"Value":"BRR1"},{"UserAttribute":2,"Operator":1,"Value":"OPP1"}],"ThenCondition":{"Permission":3,"Value":"6"}},"Id":"00000000-0000-0000-0000-000000000000"}'
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
                            sPermission_data.unshift(edited_sys_permission)
                            $("#system-permission").data("kendoGrid").dataSource.read();
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
        $('.close-sys-permission').on('click', function(e){
            sys_pop.data("kendoWindow").close()
        })
    });

    $("#system-permission").on("click", ".sys-app-delete", function(e){
        var row, grid, dataItem;
        row = $(this).closest("tr");
        grid = $("#system-permission").data("kendoGrid");
        dataItem = grid.dataItem(row);
        var page_num = grid.dataSource.pageSize() * (grid.dataSource.page() - 1) + row.index()
        var sys_pop_edit_dataSource = sysPermissionDatas.userpermissions[page_num]
        console.log(sys_pop_edit_dataSource)
        getTokenRedirect(loginRequest).then(response => {
            fetch(EMRSconfig.apiUri + '/permissions/rules/User/' + sys_pop_edit_dataSource.id, {
              method: 'DELETE',
              headers: {
                'Content-Type': 'application/json',
                "Authorization": "Bearer " + response.accessToken
              }
            })
            .then(response => response.json())
            .then(data => {
                console.log(data)
                if(data.success) {
                    sysPermissionDatas.userpermissions.splice(page_num, 1)
                    $("#system-permission").data("kendoGrid").dataSource.read();
                } else {
                    var messages = data.error.message;
                    kendo.alert(messages.join(', '))
                }
            })
        })
    })


    


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
                var data = dPermission_data[page_num];

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
                    if(key == 'UserPermissionGroup') {
                        edited_doc_permission.RuleDefination[key].push({
                            "id": document_metadata_values[j].groupid,
                            "itemName": document_metadata_values[j].groupname
                        })
                    } else {
                        edited_doc_permission.RuleDefination[key].push({
                            "id": document_metadata_values[j].id,
                            "itemName": document_metadata_values[j].name
                        })
                    }
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
                    fetch(EMRSconfig.apiUri + '/permissions/rules', {
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
                    fetch(EMRSconfig.apiUri + '/permissions/rules', {
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

    $("#document-permission").on("click", ".doc-app-delete", function(e){
        var row, grid, dataItem;
        row = $(this).closest("tr");
        grid = $("#document-permission").data("kendoGrid");
        dataItem = grid.dataItem(row);

        var page_num = grid.dataSource.pageSize() * (grid.dataSource.page() - 1) + row.index()
        var data = dPermission_data[page_num];
        console.log(data)
        getTokenRedirect(loginRequest).then(response => {
            fetch(EMRSconfig.apiUri + '/permissions/rules/Document/' + data.id, {
              method: 'DELETE',
              headers: {
                'Content-Type': 'application/json',
                "Authorization": "Bearer " + response.accessToken
              }
            })
            .then(response => response.json())
            .then(data => {
                console.log(data)
                if(data.success) {
                    dPermission_data.splice(page_num, 1)
                    $("#document-permission").data("kendoGrid").dataSource.read();
                } else {
                    var messages = data.error.message;
                    kendo.alert(messages.join(', '))
                }
            })
        })
    })

    



        

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
                    var third_select_value = sysPermissionDatas.attributeoperatormappings[i].value
                    if(third_select_value == "Groups") {
                        $(item.childNodes[replace_num]).kendoDropDownList({
                            // autoBind: false,
                            optionLabel: "Select",
                            dataTextField: "groupname",
                            dataValueField: "groupid"
                        });
                        let dropdownlist = condition_results.data("kendoDropDownList");
                        dropdownlist.setDataSource(sysPermissionDatas['groups']);
                    }
                    else{
                        $(item.childNodes[replace_num]).kendoDropDownList({
                            // autoBind: false,
                            optionLabel: "Select",
                            dataTextField: "name",
                            dataValueField: "id"
                        });
                        let dropdownlist = condition_results.data("kendoDropDownList");
                        dropdownlist.setDataSource(sysPermissionDatas[third_select_value.toLowerCase() + 's']);
                    }
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
    "AssignmentFunction": "assignmentfunctions",
    "AssignmentRole": "",
    "DocumentRole": "documentroles",
    "Occurrence": "occurrences",
    "Admin1": "",
    "Admin2": "",
    "InformationConfidentiality": "informationconfidentialitys"
}

function select_doc_meta_data(e){
    let dataItem = e.dataItem;
    let text = dataItem.name;
    console.log(text)
    let label_text = dataItem.displayname;
    let value = dataItem.id;


    let doc_meta_wrap = $('#doc-metadata-wrap')

    var readonly_ele = false;
    if(USER_PERMISSION.DocumentPermission != 2){
        readonly_ele = true;
    }
    $("div[dataName='"+text+"']").remove()
    doc_meta_wrap.append($('<div />').attr('class', 'sys-pop-edit-label').attr("dataName", text)
            .append($('<label />').text(label_text)))
        .append($('<div />').attr('class', 'sys-pop-edit-field').attr("dataName", text)
            .append($('<select />').attr("dataName", text).attr("multiple", "multiple").attr('readonly', readonly_ele)))

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
                        .append($('<select />').attr("dataName", text).attr("multiple", "multiple").attr('readonly', readonly_ele)))
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

    var readonly_ele = false;
    if(USER_PERMISSION.DocumentPermission != 2){
        readonly_ele = true;
    }
    doc_meta_wrap.append($('<div />').attr('class', 'sys-pop-edit-label').attr("dataName", text)
            .append($('<label />').text(label_text)))
        .append($('<div />').attr('class', 'sys-pop-edit-field').attr("dataName", text)
            .append($('<select />').attr("dataName", text).attr("multiple", "multiple").attr('readonly', readonly_ele)))

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


