<template lang="pug">
main#database
    section#section
        // search form
        form(@submit.prevent='searchRecords')
            .searchWhat
                .material-symbols-outlined.mid.search(style="margin-right:10px;") search
                .customSelect(style="display:inline-block;width:176px;")
                    select(v-model="advancedForm.selectedOption" style="font-size:1rem;font-weight:700")
                        option(value="Table") Table Name
                        option(value="User") User ID
                        option(value="Record ID") Record ID
                    .material-symbols-outlined.mid.selectArrowDown arrow_drop_down
            br
            .searchForm
                .selectBar(v-if="advancedForm.selectedOption == 'Table'")
                    .customSelect
                        //- select(name='access_group' v-model="advancedForm.table.access_group")
                        select(name='access_group' @change="e=>{advancedForm.table.access_group = e.target.value}" required)
                            option(value="" selected disabled hidden) Access Group
                            option(value="0") Public
                            option(value="1") Authorized
                            option(value="private") Private
                        .material-symbols-outlined.mid.selectArrowDown arrow_drop_down
                .searchBar(:class="{'fullWidth' : advancedForm.selectedOption !== 'Table'}")
                    input(
                        ref='mainSearchInput'
                        :placeholder="'Search by ' + advancedForm.selectedOption"
                        v-model="advancedForm.searchText"
                        @input="e=>{e.target.setCustomValidity('');}"
                        @change="e=>{if(advancedForm.selectedOption !== 'User' && !specialChars(e.target.value, false, true)) { e.target.setCustomValidity('Special characters are not allowed'); e.target.reportValidity(); }}"
                        :pattern="advancedForm.selectedOption === 'User' ? '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}' : null"
                        :title="advancedForm.selectedOption === 'User' ? 'Should be valid user ID' : null"
                        :required='searchIsRequired'
                    )
                    .material-symbols-outlined.mid.delete(v-if="advancedForm.searchText" @click="e=>{advancedForm.searchText = ''; mainSearchInput.focus()}") close
            .advancedForm(v-if="advancedForm.selectedOption === 'Table'")
                .left 
                    //- .condition
                    //-     .label Access Group
                    //-     .radioFormWrap
                    //-         .customSelect
                    //-             select(name='access_group' v-model="advancedForm.table.access_group" style='width:114px;padding-left:4px;')
                    //-                 option(value="0") Public
                    //-                 option(value="1") Authorized
                    //-                 option(value="private") Private
                    //-             .material-symbols-outlined.mid.selectArrowDown arrow_drop_down

                    .condition 
                        .label Subscription
                        .textFormWrap
                            input(type="text" pattern='[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}' title='Subscription ID should be the user\'s ID' name='subscription' v-model="advancedForm.table.subscription" placeholder="Subscription ID")

                    .condition 
                        .label Reference ID
                        .textFormWrap
                            input#referenceSearchInput(type="text" name='reference' @input="e=>{e.target.setCustomValidity('');}" v-model="advancedForm.reference" placeholder='Referenced Record ID | Uploaders User ID')

                    .condition 
                        .label Tag
                        .textFormWrap
                            input(type="text" name='tag' placeholder='Tag name' @input="e=>{e.target.setCustomValidity(''); advancedForm.tag=e.target.value;}" @change="e=>{if(!specialChars(e.target.value, false, true)) { e.target.setCustomValidity('Special characters are not allowed'); e.target.reportValidity(); }}")
                .right
                    //- .title Index
                    .condition 
                        .label Index Name
                        .textFormWrap
                            input(type="text" name='index_name'
                            placeholder="Name | $updated | $uploaded | $referenced_count | $user_id"
                            @input="e=>{e.target.setCustomValidity(''); if(!e.target.value) {advancedForm.index.value = ''; advancedForm.index.range = ''; } advancedForm.index.name=e.target.value; if(advancedForm.index.name === '$user_id') advancedForm.index.condition = '=' }"
                            @change="e=>{if(!specialChars(e.target.value, true, false, ['$updated','$uploaded','$referenced_count','$user_id'])) { e.target.setCustomValidity('Special characters or spaces are not allowed unless it is a reserved index name: $updated | $uploaded | $referenced_count | $user_id'); e.target.reportValidity(); }}")
                    .condition 
                        .label(:class="{'disabled': !advancedForm.index.name}") Index Value
                        .textFormWrap.indexValue.leftSelect(:class="{'disabled' : !advancedForm.index.name}")
                            .customSelect
                                select(name="index_condition" :disabled="!advancedForm.index.name || advancedForm.index.name === '$user_id'" v-model='advancedForm.index.condition')
                                    option(disabled) Condition
                                    option(value=">=") &gt;=
                                    option(value=">") &gt;
                                    option(value="=" selected) =
                                    option(value="<") &lt;
                                    option(value="<=") &lt;=
                                    option(value="~") ~
                                .material-symbols-outlined.mid.selectArrowDown(:class="{'disabled' : advancedForm.index.name === '$user_id'}") arrow_drop_down
                            input#indexValueSearchInput(
                                type="text"
                                name='index_value'
                                :required='advancedForm.index.name ? true : null'
                                :disabled="!advancedForm.index.name"
                                :title="advancedForm.index.name === '$user_id' ? 'Value should be the user ID' : advancedForm.index.name.includes('$') ? 'Value should be a number' : null"
                                :pattern="advancedForm.index.name === '$user_id' ? '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}' : advancedForm.index.name.includes('$') ? '[0-9]' : null"

                                :placeholder='indexValuePlaceholder'
                                v-model='advancedForm.index.value')
                    .condition 
                        .label(:class="{'disabled': advancedForm.index.condition !== '~' || !advancedForm.index.name}") Index Range
                        .textFormWrap(:class="{'disabled' : advancedForm.index.condition !== '~' || !advancedForm.index.name}")
                            input#indexRangeSearchInput(type="text" name='index_range' placeholder='From index value ~ to:' :disabled="advancedForm.index.condition !== '~' || !advancedForm.index.name" @input="e => {e.target.setCustomValidity(''); advancedForm.index.range = e.target.value}")

                .buttonWrap(style='width:100%; min-height:43px; text-align:right;')
                    template(v-if="fetching && advancedForm.searchText")
                        // the additional div is for alignment
                        div(style='display: inline-flex;align-items: center;width:108px;height: 43px;')
                            img.loading(style='padding:0' src="@/assets/img/loading.png")
                    template(v-else)
                        input.clear(type="reset" value="Clear filter" @click="clearSearchFilter" style="border:0;background-color:unset;color: #293FE6 !important;font-size: 0.8rem;font-weight: 700; cursor:pointer;font-family:'Radio Canada';")
                        button.final(type="submit" style="margin-left:2rem;font-family:'Radio Canada'") Search

    section#section 
        // view / edit record / create record
        .viewRecord
            // view | edit | create record
            form(:class='{recordForm: selectedRecord?.record_id, createForm: !selectedRecord?.record_id}' v-if="selectedRecord" @submit.prevent="saveRecordData")
                // left panel of record info
                .recordInfo 
                    .header
                        .tit {{ selectedRecord?.record_id ? 'Record Information' : 'Create Record' }}
                    .content(:class="{'disabled' : promiseRunning}")
                        template(v-if='selectedRecord?.record_id')
                            .info 
                                .label Record ID 
                                .value(:class="{ disabled: recordInfoEdit }" :value="selectedRecord.record_id" style="width: calc(100% - 200px);") {{ selectedRecord.record_id }}
                                .copy(v-if="!recordInfoEdit" @click="copy")
                                    .material-symbols-outlined.sml file_copy

                            .info 
                                .label User ID 
                                .value(:class="{ disabled: recordInfoEdit }" :value="selectedRecord.user_id" style="position:relative;overflow: visible;width: calc(100% - 200px); cursor: pointer")
                                    span#userId(@click.stop="()=>{if(ellipsisCheck('userId')) hiddenUserID=true}" style='width:100%;display:inline-block;white-space: nowrap;overflow: hidden;text-overflow: ellipsis;') {{ selectedRecord.user_id }}
                                    .hidden.userID(v-if="hiddenUserID" @click.stop style='top: 100%;left: -5rem;') {{ selectedRecord.user_id }}
                                .copy(v-if="!recordInfoEdit" @click="copy")
                                    .material-symbols-outlined.sml file_copy

                            .info 
                                .label Uploaded
                                .value(:class="{ disabled: recordInfoEdit }") {{ new Date(selectedRecord.uploaded).toLocaleString() }}

                            .info 
                                .label Updated
                                .value(:class="{ disabled: recordInfoEdit }") {{ new Date(selectedRecord.updated).toLocaleString() }}

                        .info 
                            .label Permission
                            .value(v-if="recordInfoEdit && selectedRecord?.record_id && selectedRecord.user_id !== account.user_id")
                                select(@change="(e) => selectedRecord.readonly = JSON.parse(e.target.value)" :value="selectedRecord.readonly.toString()")
                                    option(value="false") Read/Write
                                    option(value="true") Read Only
                            .value(v-else  :class="{ disabled: recordInfoEdit }")
                                // admin can't upload readonly because its meaningless
                                | {{ selectedRecord.readonly ? 'Read Only' : 'Read/Write' }}
                        .info
                            .label Table
                            .value.various
                                .smallInfo 
                                    .smallLabel Name 
                                    .smallValue 
                                        input(
                                            v-if="recordInfoEdit" 
                                            type="text" 
                                            placeholder="(Required)"
                                            v-model='selectedRecord.table.name'
                                            @input="e => e.target.setCustomValidity('')"
                                            @change="e=>{if(!specialChars(e.target.value, true, true)) { e.target.setCustomValidity('Special characters are not allowed'); e.target.reportValidity(); }}"
                                            :disabled="promiseRunning" required
                                        )
                                        template(v-else) {{ selectedRecord.table.name }}
                                .smallInfo 
                                    .smallLabel Access Group
                                    .smallValue 
                                        select(v-if="recordInfoEdit && selectedRecord.table.access_group !== 'private'" :value="selectedRecord.table.access_group" @change="(e) => selectedRecord.table.access_group = parseInt(e.target.value)" :disabled="promiseRunning")
                                            option(value="0") Public
                                            option(value="1") Authorized
                                        template(v-else) {{ selectedRecord.table.access_group == 'private' ? 'Private' : selectedRecord.table.access_group === 0 ? 'Public' : 'Authorized' }}
                                .smallInfo 
                                    .smallLabel Subscription
                                    .smallValue 
                                        template(v-if="recordInfoEdit")
                                            input#forSubscribers(style='width:unset;vertical-align:middle;' type='checkbox' :checked="selectedRecord.table.subscription ? true : null" @change="(e) => selectedRecord.table.subscription = e.target.checked" :disabled="promiseRunning")
                                            label(for='forSubscribers' style='margin-left:1em;opacity:0.6') (Only subscribed users can read)

                                        template(v-else) {{ selectedRecord.table?.subscription ? 'Required' : 'None' }}
                        .info
                            .label Index
                            .value.various
                                .smallInfo 
                                    .smallLabel Name 
                                    .smallValue 
                                        input(
                                            v-if="recordInfoEdit"
                                            type="text"
                                            :value="selectedRecord.index?.name || ''"
                                            @change="e=>{if(!specialChars(e.target.value, true, false)) { e.target.setCustomValidity('Special characters or spaces are not allowed'); e.target.reportValidity(); }}"
                                            placeholder="No Index"
                                            @input="(e)=> { e.target.setCustomValidity(''); if (!selectedRecord.index) { selectedRecord.index={}; } selectedRecord.index.name = e.target.value; }"
                                            :disabled="promiseRunning"
                                        )
                                        template(v-else) {{ selectedRecord.index?.name || 'No Index' }}
                                .smallInfo 
                                    .smallLabel Value 
                                    .smallValue(:class="{'indexValue' : !recordInfoEdit}")
                                        .typeValue(v-if="recordInfoEdit" :class="{ nonClickable: !selectedRecord?.index?.name }" :style='{opacity: selectedRecord?.index?.name ? 1 : 0.5}')
                                            select(:value="indexValueType" @change="handleIndexTypeChange" :disabled="promiseRunning")
                                                option(value="string") String
                                                option(value="number") Number
                                                option(value="boolean") Boolean 

                                            select(
                                                v-if="indexValueType === 'boolean'"
                                                :value="selectedRecord.index?.value.toString()"
                                                @change="(e) => { if (!selectedRecord.index) { selectedRecord.index={}; } selectedRecord.index.value = JSON.parse(e.target.value); }"
                                                :disabled="promiseRunning"
                                            )
                                                option(value="true") true
                                                option(value="false") false

                                            input(
                                                v-else 
                                                :type="indexValueType === 'string' ? 'text' : 'number'" :value="selectedRecord.index?.value"
                                                placeholder="(Value Required)"
                                                :step="indexValueType === 'string' ? null : '.01'"
                                                @input="(e)=> { e.target.setCustomValidity(''); if(!selectedRecord.index) { selectedRecord.index={}; } selectedRecord.index.value = indexValueType === 'number' ? e.target.value.includes('.') ? parseFloat(e.target.value) : parseInt(e.target.value) : e.target.value; }"
                                                @change="e=>{if(indexValueType==='string' && !specialChars(e.target.value, false, true)) { e.target.setCustomValidity('Special characters are not allowed'); e.target.reportValidity(); }}"
                                                :required="selectedRecord?.index?.name ? true : null"
                                                :disabled="promiseRunning"
                                            )
                                        template(v-else-if='!selectedRecord.index?.name') No Index
                                        template(v-else) {{ typeof selectedRecord.index.value }} | {{ selectedRecord.index.value }}

                        .info 
                            .label Reference
                            .value.various
                                .smallInfo 
                                    .smallLabel Reference ID
                                    .smallValue 
                                        input#referenceIdInput(v-if="recordInfoEdit" type="text" :value="selectedRecord.reference?.record_id || ''" placeholder="Record ID to reference (optional)" @input="(e) => {selectedRecord.reference.record_id = e.target.value || null; e.target.setCustomValidity('')}" :disabled="promiseRunning")
                                        template(v-else) {{ selectedRecord.reference.record_id || 'None' }}
                                    .copy(v-if="!recordInfoEdit && selectedRecord.reference.record_id" @click="copy")
                                        .material-symbols-outlined.sml file_copy

                                .smallInfo 
                                    .smallLabel Multiple Reference 
                                    .smallValue 
                                        select(v-if="recordInfoEdit" :value="JSON.stringify(selectedRecord.reference.allow_multiple_reference)" @change="(e) => {selectedRecord.reference.allow_multiple_reference = e.target.value ? JSON.parse(e.target.value) : false}" :disabled="promiseRunning")
                                            option(value="true") Allowed
                                            option(value="false") Not Allowed
                                        template(v-else) {{ selectedRecord.reference.allow_multiple_reference ? 'Allowed' : 'Not Allowed' }}
                                .smallInfo 
                                    .smallLabel Reference Limit
                                    .smallValue 
                                        input(v-if="recordInfoEdit" type="number" min="0" :value="selectedRecord.reference.reference_limit === null ? '' : selectedRecord.reference?.reference_limit" placeholder="Infinite" @input="(e) => selectedRecord.reference.reference_limit = e.target.value ? parseInt(e.target.value) : null" :disabled="promiseRunning")
                                        template(v-else) {{ selectedRecord.reference.reference_limit || 'Infinite' }}

                        .info 
                            .label Tags 
                            .value.tags(style="width: calc(100% - 170px);")
                                .tagsWrapper#tagsWrapper(@click.stop="e=>{if(recordInfoEdit && !promiseRunning) editTags=(()=>{if(!selectedRecord?.tags) {selectedRecord.tags = []} return selectedRecord.tags;})(); else if(ellipsisCheck('tagsWrapper')) hiddenTags=true;}")
                                    template(v-if="selectedRecord?.tags?.length")
                                        .tag(v-for="tag in selectedRecord?.tags") {{ tag }}
                                    template(v-else) {{ recordInfoEdit ? 'Add Tags' : '-'}}
                        .hidden.tags(v-if="hiddenTags && selectedRecord?.tags" @click.stop)
                            .tag(v-for="tag in selectedRecord?.tags") {{ tag }}

                // right panel of record info
                .recordData
                    .header
                        template(v-if="!recordInfoEdit && selectedRecord?.record_id")
                            .tit Type
                            .tit Key Name 
                            .tit Context
                            .tit.small Data List
                    .content(:class="{'disabled' : promiseRunning}")
                        .noData(v-if="selectedRecord.data && selectedRecord.data.hasOwnProperty('__is_private__')")
                            .material-symbols-outlined.big lock
                            p Private Data

                        template(v-else-if="records_data.length")

                            template(v-for="(data, index) in records_data" :key="index")
                                // data display
                                template(v-if="records_data.length && !recordInfoEdit")
                                    .row(@click="()=>{ if(data.download) data.download(); else if((data.type === 'json' || data.type === 'string') && ellipsisCheck('data-context-' + index)) showRecordDataValue=data}" :class="{'disabled' : ['boolean', 'number', 'string'].includes(data.type), 'file': data.download}")
                                        //- .data {{ data.type }}
                                        .data 
                                            .material-symbols-outlined.mid(v-if="data.type == 'string'") font_download
                                            .material-symbols-outlined.mid(v-else-if="data.type == 'binary'") draft
                                            .material-symbols-outlined.mid(v-else-if="data.type == 'json'") data_object
                                            .material-symbols-outlined.mid(v-else-if="data.type == 'boolean'") flaky
                                            .material-symbols-outlined.mid(v-else="data.type == 'number'") pin
                                        .data
                                            .overflow(v-if="data?.key") {{ data.key }}
                                            .overflow(v-else) -
                                        .data 
                                            .overflow(:id='"data-context-" + index') {{ data.context }}
                                        .material-symbols-outlined.sml.download(v-if="data.download") download

                                // data edit
                                template(v-else)
                                    .rowEdit
                                        .material-symbols-outlined.sml.minus(@click="e=>removeData(index)") do_not_disturb_on

                                        select.type(:value="data.type" @change="(e) => selectType(e, data)" :disabled="promiseRunning || selectedRecord.record_id && data.download || null")
                                            // on edit, record file data cannot be changed. only delete is allowed
                                            option(value="json") JSON
                                            option(value="string") String
                                            option(value="boolean") Boolean
                                            option(value="file") File
                                            option(value="number") Number
                                            option(value="binary" v-if='data.type === "binary"') Binary

                                        // on edit, record file data cannot be changed. only delete is allowed
                                        div(v-if='selectedRecord.record_id && data.download' style='opacity:0.5; width: 84px;margin-right: 20px;') {{ data.key }}

                                        input.key(v-else type="text" v-model="data.key" placeholder="Key name" :disabled="promiseRunning" required)

                                        template(v-if="data.type == 'json'")
                                            .context.click(@click="showRecordDataValue=Object.assign(data, {edit:true})")
                                                .overflow {{ data.context }}

                                        template(v-else-if="data.type == 'boolean'")
                                            select.context(:value="data.context === 'true' ? data.context : 'false'" @change="(e) => data.context = e.target.value" :disabled="promiseRunning")
                                                option(value="true") true
                                                option(value="false") false

                                        template(v-else-if="data.type == 'file' || data.type == 'binary'")
                                            template(v-if='selectedRecord.record_id && typeof data.context === "string" && data.context')
                                                // on edit, record file data cannot be changed. only delete is allowed
                                                div(style='width: calc(100% - 208px);')
                                                    span(style='vertical-align: middle;display: inline-block;white-space: nowrap;width: calc(100% - 35px);overflow: hidden;text-overflow: ellipsis;opacity: 0.5') {{ data.context }}
                                                    .material-symbols-outlined.sml(@click='data.download()' style='float: right; cursor: pointer;') download

                                            template(v-else)
                                                .context.fileUpload(style='white-space: nowrap;overflow: hidden;flex-shrink: 1;text-overflow: ellipsis;' @click='e=>{ e.target.children[0].click() }') {{ data.context ? data.context.name : 'Choose a file' }}
                                                    input(@click.stop type="file" @change="e=>{ data.context=e.target.files[0] }" required hidden)

                                        template(v-else)
                                            input.context(:type="data.type === 'number' ? 'number' : 'text'" v-model="data.context" :placeholder="`<${data.type}> Value`" :disabled="promiseRunning")

                            template(v-if="!recordInfoEdit" v-for="i in dataTrCount" :key="'extra-' + i")
                                .row.empty

                        .noData(v-else-if="!recordInfoEdit" style="margin-top:150px;")
                            .material-symbols-outlined.big scan_delete
                            p No data

                        .addDataRow(v-if="!(selectedRecord.data && selectedRecord.data.hasOwnProperty('__is_private__')) && recordInfoEdit" @click="addField")  
                            .material-symbols-outlined.sml add_circle
                            span Add data

                // right panel top right menu
                .menu(:class='{"nonClickable": !account.email_verified || currentService.active == 0}' v-if="!recordInfoEdit" @click.stop="showEdit = !showEdit") 
                    // drop down menu (no edit)
                    .material-symbols-outlined.mid.clickable more_vert
                    #moreVert(v-if="showEdit" @click.stop style="--moreVert-right: 0")
                        .inner
                            .more(@click="recordInfoEdit = true; showEdit = false;")
                                .material-symbols-outlined.mid edit
                                span edit
                            .more(@click="recordDelete(selectedRecord.record_id); showEdit = false;")
                                .material-symbols-outlined.mid delete
                                span delete

                //- .material-symbols-outlined.mid.editMenuWrap_v2 menu


                // buttons (edit)
                .editBtnWrap(v-if="recordInfoEdit") 
                    template(v-if="promiseRunning")
                        img.loading(src="@/assets/img/loading.png" style="width:20px;height:20px;margin-top:11px;")
                    template(v-else)
                        button.cancel(type='button' @click="()=>{recordInfoEdit = false; selectedRecord = recordPage.list[selectedRecord.record_id] ? JSON.parse(JSON.stringify(recordPage.list[selectedRecord.record_id])) : null; }" title="cancel") 
                            .material-symbols-outlined.mid close
                            //- span(v-else) Cancel
                        button.save(title="save")
                            .material-symbols-outlined.mid check
                            //- span(v-else) Save

            template(v-else)
                .searchInfo(v-if='searchInfo')
                    template(v-if='searchInfo.table')
                        .label Table Information
                        br
                        .indent
                            .label Name:
                            .data {{ searchInfo.table.table }}
                            br
                            .label # of records:
                            .data {{ searchInfo.table.number_of_records }}
                    template(v-if='searchInfo.reference')
                        .label Reference Information
                        br
                        .indent
                            .label Record ID:
                            .data {{ searchInfo.reference.record_id }}
                            br
                            .label # of times referenced:
                            .data {{ searchInfo.reference.referenced }}
                            br
                            .label Reference limit:
                            .data {{ searchInfo.reference.reference_limit || 'Infinite' }}
                            br
                            .label Allows multiple reference:
                            .data {{ searchInfo.reference.allow_multiple_reference ? 'Yes' : 'No' }}
                    template(v-if='searchInfo.index')
                        .label Index Information
                        br
                        .indent
                            .label Name:
                            .data {{ searchInfo.index.index }}
                            br
                            .label # of records:
                            .data {{ searchInfo.index.number_of_records }}
                            br
                            .label # of strings:
                            .data {{ searchInfo.index.string_count || 0 }}
                            br
                            .label # of numbers:
                            .data {{ searchInfo.index.number_count || 0 }}
                            br
                            .indent
                                .label Sum:
                                .data {{ searchInfo.index.total_number || 0 }}
                                br
                                .label Average:
                                .data {{ searchInfo.index.average_number || 0 }}
                            .label # of booleans:
                            .data {{ searchInfo.index.boolean_count || 0 }}
                            br
                            .indent
                                .label # of true:
                                .data {{ searchInfo.index.total_bool || 0 }}
                                br
                                .label Average rate:
                                .data {{ searchInfo.index.average_bool || 0 }}

                    template(v-if='searchInfo.tag')
                        .label Tag Information
                        br
                        .indent
                            .label Name:
                            .data {{ searchInfo.tag.tag }}
                            br
                            .label # of records:
                            .data {{ searchInfo.tag.number_of_records }}

                .noSelect(v-else) No record selected

        // top menu of record list
        .tableHeader 
            .actions 
                .material-symbols-outlined.mid.refresh.clickable(@click='()=>{selectedRecord=null; refresh(fetchParams);}' :class='{"rotate_animation": fetching }' title="refresh") cached
                .material-symbols-outlined.mid.create.clickable(:class="{'nonClickable' : !account.email_verified || currentService.active == 0}" @click="()=>{ !account.email_verified ? false : selectedRecord = JSON.parse(JSON.stringify(createRecordTemplate)); recordInfoEdit=true; }" title="add record") note_stack_add
                .menu(:class='{"nonClickable": !checkedRecords.length || !account.email_verified || currentService.active == 0}' @click.stop="!account.email_verified ? false : showRecordSetting = !showRecordSetting" title="menu") 
                    .material-symbols-outlined.mid.clickable more_vert
                    #moreVert(v-if="showRecordSetting" @click.stop style="--moreVert-left: 0")
                        .inner
                            .more(@click="()=>{recordDelete(); showRecordSetting=false;}")
                                .material-symbols-outlined.mid delete
                                span delete
            .pagenator 
                .material-symbols-outlined.sml.prevPage.clickable(:class='{"nonClickable": currentPage === 1 || fetching }' @click='nextPage(false)' title="prev page") arrow_back_ios
                .material-symbols-outlined.sml.nextPage.clickable(:class='{"nonClickable": maxPage <= currentPage && recordPage?.endOfList || fetching }' @click='nextPage' title="next page") arrow_forward_ios

        // record list
        .tableWrap
            table
                thead
                    tr
                        th(style="min-width:50px; padding-left:5px;")
                            .customCheckBox(:class='{"nonClickable": fetching || records && !records.length}')
                                input#allRecords(type="checkbox" value='allRecords' @click="selectAll" :checked="checkedRecords.length >= 10")
                                label(for="allRecords")
                                    .material-symbols-outlined.mid.check check
                        th(style="min-width:150px;") Table Name
                        th(style="min-width:150px;") Record ID
                        th(style="min-width:305px;") User ID
                        th.center(style="min-width:100px;") Date
                        th.center(style="min-width:150px;") Access Group
                        th.center(style="min-width:200px;") Features
                tbody(v-if="records && records.length")
                    tr(v-for="record in records" @click="()=>{ recordInfoEdit=false; if(selectedRecord?.record_id === record?.record_id) selectedRecord = null; else if(selectedRecord?.record_id !== record.record_id) selectedRecord = JSON.parse(JSON.stringify(record)) }" :class="{ active: selectedRecord?.record_id === record.record_id }")
                        td(@click.stop style="padding-left:5px;")
                            .customCheckBox
                                input(type="checkbox" name="record" :id="record.record_id" @change='trackSelectedRecords' :value="record.record_id")
                                label(:for="record.record_id")
                                    .material-symbols-outlined.mid.check check
                        td
                            .name {{ record.table.name }}
                        td
                            .recordId {{ record.record_id }}
                        td
                            .userId(style="white-space:none") {{ record.user_id }}
                        td.center 
                            .uploaded {{ timeSince(record.uploaded) }}
                        td.center
                            .accessWrap
                                .hoverWrap(v-if="record.table.access_group == 'private'")
                                    .material-symbols-outlined.mid(v-if="record.table.access_group == 'private'") vpn_key
                                    .hoverPreview(style="--pos-l:45px; --arr-l:25px") Private
                                .hoverWrap(v-else-if="record.table.access_group > 0")
                                    .material-symbols-outlined.mid person
                                    .hoverPreview(style="--pos-l:30px; --arr-l:40px") Authorized
                                .hoverWrap(v-else-if="record.table.access_group == 0")
                                    .material-symbols-outlined.mid language
                                    .hoverPreview(style="--pos-l:45px; --arr-l:25px") Public

                        // indexes
                        td
                            .featureWrap
                                .hoverWrap
                                    template(v-if='record?.tags?.length' style='display: inline-block')
                                        h6.feature.tag Tag
                                        .hoverPreview(style="--pos-r: 0; --arr-r:0; max-width: 25vw")
                                            // .tagsWrapper_ext - reference style section below
                                            .tagsWrapper_ext
                                                .tag(v-for='t in record.tags') {{ t }}
                                    .empty(v-else)
                                .hoverWrap
                                    template(v-if='record?.index' style='display: inline-block')
                                        h6.feature.index Index
                                        .hoverPreview(style="--pos-r: 0; --arr-r:0")
                                            span(style='white-space: nowrap') {{ record.index.name }} | {{ typeof record.index.value === 'string' ? '"'+record.index.value+'"' : record.index.value }}
                                    .empty(v-else)
                                .hoverWrap
                                    template(v-if='record?.reference?.record_id' style='display: inline-block')
                                        h6.feature.ref Ref
                                        .hoverPreview(style="--pos-r: 0; --arr-r:0")
                                            span(style='white-space: nowrap') {{ record?.reference?.record_id }}
                                    .empty(v-else)

                    tr(v-for="i in trCount" :key="'extra-' + i")

            .noRecordsFound(v-if="records && !records.length")
                .tit 
                    .material-symbols-outlined.big search
                    h3 No Records Found
                p There was no record matching query

    TagEditor(v-if="editTags" @close="editTags = null" :tags="editTags")
    RecordDataOverlay(v-if="showRecordDataValue" @close="showRecordDataValue = null" :selectedData="showRecordDataValue" @save="saveRecordDataValue")
    DeleteRecordOverlay(v-if="showDeleteRecord" @close="showDeleteRecord = null;" :toDelete="showDeleteRecord")
</template>

<script setup>
import { bodyClick } from '@/main.js';
import { computed, nextTick, onBeforeMount, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue';
import RecordDataOverlay from '@/views/Service/Records/RecordDataOverlay.vue';
import DeleteRecordOverlay from '@/views/Service/Records/DeleteRecordOverlay.vue';
import TagEditor from '@/views/Service/Records/TagEditor.vue';
import { account, skapi } from '@/main.js';
import { currentService } from '@/data.js';
import { selectedRecord, records_data, indexValueType, remove_bin, specialChars } from '@/views/Service/Records/RecordEdit';
import { searchInfo, launch, serviceRecords, getPage, records, selectNone, recordPage, currentPage, maxPage, fetching, refresh, nextPage, timeSince, fetchParams } from '@/views/Service/Records/RecordFetch';

selectedRecord.value = null;
launch();
let promiseRunning = ref(false);
let showRecordDataValue = ref(null);
let showRecordData = ref(false);
let showDeleteRecord = ref(null);
let showRecordSetting = ref(false);
let showEdit = ref(false);
let hiddenUserID = ref(false);
let hiddenTags = ref(false);
let editTags = ref(null);
let mainSearchInput = ref(null);
let recordInfoEdit = ref(false);
let advancedForm = reactive({
    selectedOption: 'Table',
    searchText: '',
    table: {
        access_group: 0,
        subscription: '',
    },
    index: {
        name: '',
        value: '',
        condition: '=',
        range: ''
    },
    tag: '',
    reference: ''
});

let indexValuePlaceholder = computed(() => {
    let n = advancedForm.index.name;
    if (n === '$user_id') {
        return 'Uploader\'s ID'
    }
    if (n === '$referenced_count') {
        return 'Numbers only'
    }
    if (n === '$uploaded' || n === '$updated') {
        return '13 Digit timestamp number'
    }
    return 'for strings, do "1234" | "false"'
})

let searchIsRequired = computed(() => {
    return advancedForm.index.name || advancedForm.table.subscription || advancedForm.tag || advancedForm.reference || null
});

let searchRecords = () => {
    selectedRecord.value = null;

    if (advancedForm.searchText === '') {
        refresh();
        return;
    }

    let params;
    switch (advancedForm.selectedOption) {
        case 'User ID':
            params = {
                service: currentService.value.service,
                reference: advancedForm.searchText
            }
            break;
        case 'Record ID':
            params = {
                service: currentService.value.service,
                record_id: advancedForm.searchText
            }
            break;
        case 'Table':
            skapi.getTables({
                service: currentService.value.service,
                table: advancedForm.searchText,
            }).then(t => {
                if (searchInfo.value === null) {
                    searchInfo.value = {};
                }
                if (t.list.length) {
                    searchInfo.value.table = t.list[0]
                }
            });

            if (advancedForm.index.name && advancedForm.index.name.slice(-1) !== '.' && !advancedForm.index.name.includes('$')) {
                skapi.getIndexes({
                    service: currentService.value.service,
                    table: advancedForm.searchText,
                    index: advancedForm.index.name
                }).then(t => {

                    if (t.list.length) {
                        if (searchInfo.value === null) {
                            searchInfo.value = {};
                        }
                        searchInfo.value.index = t.list[0]
                    }
                });
            }

            if (advancedForm.tag) {
                skapi.getTags({
                    service: currentService.value.service,
                    table: advancedForm.searchText,
                    tag: advancedForm.tag
                }).then(t => {

                    if (t.list.length) {
                        if (searchInfo.value === null) {
                            searchInfo.value = {};
                        }
                        searchInfo.value.tag = t.list[0]
                    }
                });
            }

            if (advancedForm.reference) {
                if (!advancedForm.reference.includes('-')) {
                    skapi.getRecords({
                        service: currentService.value.service,
                        record_id: advancedForm.reference
                    }).then(r => {
                        if (r.list.length) {
                            if (searchInfo.value === null) {
                                searchInfo.value = {};
                            }
                            searchInfo.value.reference = {
                                record_id: advancedForm.reference,
                                referenced: r.list[0].reference.referenced_count,
                                reference_limit: r.list[0].reference.reference_limit,
                                allow_multiple_reference: r.list[0].reference.allow_multiple_reference
                            }
                        }
                    }).catch(err => {
                        if (err.message.includes('not exists')) {
                            document.getElementById('referenceSearchInput').setCustomValidity('Reference does not exists.');
                            document.getElementById('referenceSearchInput').reportValidity();
                        }
                    });
                }
            }

            params = {
                service: currentService.value.service,
                table: {
                    name: advancedForm.searchText,
                    access_group: advancedForm.table.access_group === 'private' ? 'private' : parseInt(advancedForm.table.access_group),
                    subscription: advancedForm.table.subscription
                },
                index: {
                    name: advancedForm.index.name,
                    value: (() => {
                        let val = advancedForm.index.value;
                        try {
                            val = JSON.parse(val);
                        }
                        catch (err) { }
                        return val;
                    })(),
                    condition: advancedForm.index.condition === '~' ? '=' : advancedForm.index.condition,
                    range: advancedForm.index.condition === '~' ? (() => {
                        let val = advancedForm.index.range;
                        try {
                            val = JSON.parse(val);
                        }
                        catch (err) { }
                        return val;
                    })() : undefined,
                },
                tag: advancedForm.tag || undefined,
                reference: advancedForm.reference || undefined,
            }
            if (!params.index.name) {
                delete params.index;
            }
            if (!params.table.subscription) {
                delete params.table.subscription;
            }

            break;
    }

    if (params.index) {
        if (!params.index.name.includes('$')) {
            if (typeof params.index.value === 'string' && !specialChars(params.index.value, false, true)) {
                document.getElementById('indexValueSearchInput').setCustomValidity('Index value should not have special characters.');
                document.getElementById('indexValueSearchInput').reportValidity();
                return;
            }

            if (params.index.range && typeof params.index.value !== typeof params.index.range) {
                document.getElementById('indexRangeSearchInput').setCustomValidity('Range value should be same type as index value.');
                document.getElementById('indexRangeSearchInput').reportValidity();
                return;
            }

            // check special chars for range value
            if (params.index.range && typeof params.index.range === 'string' && !specialChars(params.index.range, false, true)) {
                document.getElementById('indexRangeSearchInput').setCustomValidity('Index range should not have special characters.');
                document.getElementById('indexRangeSearchInput').reportValidity();
                return;
            }
        }
    }


    refresh(params);
}

let createRecordTemplate = {
    table: {
        name: '',
        access_group: 0,
        subscription: false,
    },
    index: {
        name: '',
        value: '',
    },
    reference: {
        allow_multiple_reference: true,
        reference_limit: null
    },
    tags: [],
    readonly: false
};

let dataList = ref([]);
let checkedRecords = ref([]);
let selectedData = ref(null);
let firstInput = ref('');
let isSmallScreen = ref(window.innerWidth < 1200)
let maxTrCount = 10;

let trCount = computed(() => {
    return Math.max(0, maxTrCount - records.value.length);
});
let dataTrCount = computed(() => {
    return Math.max(0, maxTrCount - records_data.value.length);
});

let saveRecordDataValue = d => {
    for (let key in d) {
        showRecordDataValue.value[key] = d[key];
    }
    showRecordDataValue.value = null;
}

let copy = (e) => {
    let doc = document.createElement('textarea');
    doc.textContent = e.target.parentNode.previousSibling.textContent;
    document.body.append(doc);
    doc.select();
    document.execCommand('copy');
    doc.remove();

    e.target.parentNode.classList.add('copied');
    setTimeout(() => {
        e.target.parentNode.classList.remove('copied');
    }, 1000);
}

let clearSearchFilter = () => {
    let init = {
        searchText: '',
        table: {
            access_group: 0,
            subscription: '',
        },
        index: {
            name: '',
            value: '',
            condition: '=',
            range: ''
        },
        tag: '',
        reference: ''
    };
    for (let key in init) {
        advancedForm[key] = init[key];
    }
    if (fetchParams !== null) {
        refresh();
    }
}

let selectAll = (e) => {
    let checkboxes = document.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach((checkbox) => {
        checkbox.checked = e.target.checked;
    })
    trackSelectedRecords();
}

let trackSelectedRecords = () => {
    let checkboxes = document.querySelectorAll('input[type="checkbox"]');
    let checked = [];
    checkboxes.forEach((checkbox) => {
        if (checkbox.checked && checkbox.value !== 'selectall') {
            checked.push(checkbox.value);
        }
    })
    checkedRecords.value = checked;
    if(checkedRecords.value[0] == 'allRecords') {
        checkedRecords.value.shift();
    }
}

// recordData edit
let addField = () => {
    if (promiseRunning.value) {
        return false;
    }
    records_data.value.push({ type: 'string', key: '', context: '' });
    nextTick(() => {
        let scrollTarget = document.querySelector('.recordData .content');
        if (scrollTarget.getBoundingClientRect().height < scrollTarget.scrollHeight) {
            scrollTarget.scrollTop = scrollTarget.getBoundingClientRect().height + 30;
        }
    })
};

let removeData = (index) => {
    if (promiseRunning.value)
        return

    let dat = records_data.value[index];
    if (dat.type === 'binary') {
        remove_bin.push(dat.endpoint);
    }

    records_data.value.splice(index, 1)
}

let selectType = (e, data) => {
    data.type = e.target.value;
    if (data.type === 'string') {
        data.context = '';
    }
    else if (data.type === 'number') {
        data.context = '0';
    }
    else if (data.type === 'boolean') {
        data.context = 'false';
    }
    else if (data.type === 'file') {
        data.context = '';
    }
    else if (data.type === 'json') {
        data.context = 'null';
    }
}

let saveRecordData = async () => {
    promiseRunning.value = true;
    let record_params = {
        service: currentService.value.service,
        record_id: selectedRecord.value.record_id,
        readonly: selectedRecord.value.readonly,
        table: selectedRecord.value.table,
        index: selectedRecord.value.index,
        reference: selectedRecord.value.reference,
        tags: selectedRecord.value.tags
    };

    let data = {};

    if (!record_params.table.subscription) {
        delete record_params.table.subscription;
    }
    if (!record_params.index?.name) {
        record_params.index = null;
    }

    // let to_bin = null;
    // build record data
    let rec_data = records_data.value;

    if (!rec_data.length) {
        data = null;
    }
    else {
        let form = new FormData();

        let hasNoData = true;
        for (let d of rec_data) {
            console.log(d.context)
            if (d.type === 'string') {
                hasNoData = false;
                // add to form
                form.append(d.key, d.context);
            }
            else if (d.type === 'number' || d.type === 'boolean' || d.type === 'json') {
                hasNoData = false;
                // data to blob
                let blob = new Blob([d.context], { type: "application/json" });
                // add to form
                form.append(d.key, blob);
            }
            else if (d.type === 'file' && typeof d.context !== 'string') {
                hasNoData = false;
                form.append(d.key, d.context);
            }
        }

        if (hasNoData) {
            data = null;
        }
        else {
            data = form;
        }
    }

    if (remove_bin.length) {
        record_params.remove_bin = remove_bin;
    }

    let progress = e => {
        console.log(e);
    }

    record_params.progress = progress;
    let res;
    try {
        res = await skapi.postRecord(data, record_params);
    }
    catch (err) {
        promiseRunning.value = false;
        let errmsg = err.message.charAt(0).toUpperCase() + err.message.slice(1)
        if (err.message.includes('referenc')) {
            document.getElementById('referenceIdInput').setCustomValidity(errmsg)
            document.getElementById('referenceIdInput').reportValidity()
        }
        else {
            alert(errmsg)
            throw err
        }
        return
    }

    // do not remove the code below!
    if (res.bin && Object.keys(res.bin).length > 0 && !Array.isArray(res.bin)) {
        for (let i in res.bin) {
            for (let j of res.bin[i]) {
                delete j.getFile; // deleting because pager cannot parse a function
            }
        }
    }

    recordInfoEdit.value = false;

    if (record_params.record_id) {
        await recordPage.editItem(res);
    }
    else {
        await recordPage.insertItems([res]);
    }

    getPage(currentPage.value);

    selectedRecord.value = res;
    promiseRunning.value = false;
}

// create Record
let createAddField = () => {
    dataList.value.push({
        type: "json",
        key: "",
        context: ""
    });
}

// delete Record
let recordDelete = (id) => {
    id = id ? [id] : (() => {
        let ids = [];
        for (let i of checkedRecords.value) {
            if (i !== 'allRecords')
                ids.push(i);
        }
        return ids;
    })();

    let recDelete = async () => {
        skapi.deleteRecords({
            service: currentService.value.service,
            record_id: id
        });
        for (let i of id) {
            if (selectedRecord.value && i === selectedRecord.value.record_id) {
                selectedRecord.value = null;
            }
            await recordPage.deleteItem(i);
        }
        selectNone();
        getPage(currentPage.value);
    }

    showDeleteRecord.value = { cb: recDelete, count: id.length };
}

let handleResize = () => {
    isSmallScreen.value = window.innerWidth < 1200;
};

onMounted(() => {
    window.addEventListener('resize', handleResize);
});
onBeforeUnmount(() => {
    window.removeEventListener('resize', handleResize);
});

bodyClick.recordPage = () => {
    showRecordSetting.value = false;
    showEdit.value = false;
    hiddenTags.value = false;
    hiddenUserID.value = false;
}

let ellipsisCheck = (id) => {
    let e = document.getElementById(id);
    return e.offsetWidth < e.scrollWidth;
}

let handleIndexTypeChange = (e) => {
    let originalValue = recordPage.list[selectedRecord.value.record_id]?.index?.value;
    let valueType = e.target.value;

    if (!selectedRecord.value.index) {
        selectedRecord.value.index = {};
    }

    if (valueType === 'boolean') {
        selectedRecord.value.index.value = typeof originalValue === 'boolean' ? originalValue : true;
    }
    else if (valueType === 'number') {
        selectedRecord.value.index.value = typeof originalValue === 'number' ? originalValue : 0;
    }
    else {
        selectedRecord.value.index.value = typeof originalValue === valueType ? originalValue : '';
    }

    indexValueType.value = valueType;
}

let handleKeydown = (e) => {
    if (recordInfoEdit.value) { return }
    if (!selectedRecord?.value?.record_id) { return }

    if (e.key == 40 || e.key == "ArrowDown" || e.key == 38 || e.key == "ArrowUp") {
        e.preventDefault();
    }

    let selectedIndex = records.value.findIndex(record => record.record_id === selectedRecord.value.record_id);
    let lastIndex = records.value.length - 1;

    if (e.key == 40 || e.key == "ArrowDown") {
        if (selectedIndex < lastIndex) {
            selectedRecord.value = records.value[selectedIndex + 1];
        }
    } else if (e.key == 38 || e.key == "ArrowUp") {
        if (selectedIndex > 0) {
            selectedRecord.value = records.value[selectedIndex - 1];
        }
    }
}

// 방향키 select Record
watch(() => selectedRecord.value, () => {
    if (selectedRecord.value) {
        document.addEventListener('keydown', handleKeydown);
    } else {
        document.removeEventListener('keydown', handleKeydown);
    }
})
</script>

<style lang="less" scoped>
#database {
    max-width: 1200px;
    margin: 0 auto;

    #section {
        width: 100%;
        padding: 1.4rem 2rem;
        background-color: #fafafa;
        border-radius: 8px;
        margin-bottom: 2%;
        filter: drop-shadow(0px 2px 4px rgba(0, 0, 0, 0.10));
        overflow: hidden;
    }

    .searchForm {
        display: flex;
        flex-wrap: nowrap;

        .selectBar {
            width: 200px;
            margin-right: 1rem;

            select {
                height: 44px;
                background: rgba(0, 0, 0, 0.05);
                font-size: 0.8rem;
                padding: 0 1rem;
                font-weight: 500;
                color: rgba(0,0,0,0.6);
            }
            .selectArrowDown {
                color: rgba(0,0,0,0.6);
            }
        }

        .searchBar {
            position: relative;
            width: calc(100% - 200px - 1rem);

            &.fullWidth {
                width: 100%;
            }

            input {
                width: 100%;
                height: 44px;
                border: 0;
                border-radius: 8px;
                background: rgba(0, 0, 0, 0.05);
                font-size: 0.8rem;
                padding-left: 20px;
                font-weight: 400;
            }

            .search {
                position: absolute;
                left: 16px;
                top: 10px;
                color: rgba(0, 0, 0, 0.4);
            }

            .delete {
                position: absolute;
                right: 16px;
                top: 10px;
                cursor: pointer;
            }
        }
    }

    .advancedForm {
        margin-top: 1.5rem;

        > div {
            width: 48%;
            display: inline-block;
        }

        .left {
            margin-right: 4%;
        }

        .right {
            .title {
                color: rgba(0, 0, 0, 0.60);
                font-size: 0.7rem;
                font-weight: 700;
                margin-bottom: 20px;
            }
        }

        .condition {
            margin-bottom: 0.5rem;

            &:last-child {
                margin-bottom: 1.4rem;
            }

            .label,
            .radioFormWrap,
            .radio {
                display: inline-block;
            }

            .label {
                width: 90px;
                color: rgba(0, 0, 0, 0.60);
                font-size: max(0.7rem, 13px);
                font-weight: 700;
                margin-right: 1.7rem;

                &.disabled {
                    color: rgba(0, 0, 0, 0.25);
                }
            }

            .radioFormWrap {
                select {
                    width: 110px;
                    border: 0;
                    background: unset;
                    color: rgba(0, 0, 0, 0.60);
                    font-size: 0.7rem;
                    font-weight: 700;
                }
            }

            .radio {
                margin-right: 1rem;
            }

            .textFormWrap {
                width: calc(100% - 6.7rem);
                display: inline-block;
                overflow: hidden;

                input {
                    position: relative;
                    width: 100%;
                    border: 0;
                    border-bottom: 1px solid rgba(0, 0, 0, 0.80);
                    background-color: unset;
                    padding: 1px 4px;
                }

                input:disabled {
                    border-bottom: 1px solid rgba(0, 0, 0, 0.10);
                }

                &.indexValue {
                    position: relative;

                    &::after {
                        position: absolute;
                        content: '';
                        right: 70px;
                        top: 50%;
                        transform: translateY(-50%);
                        width: 1px;
                        height: 60%;
                        background-color: #000;
                    }

                    &.leftSelect {
                        border-bottom: 1px solid rgba(0, 0, 0, 0.8);

                        &::after {
                            left: 70px;
                        }

                        &.disabled {
                            border-bottom: 1px solid rgba(0, 0, 0, 0.1);
                        }

                        input {
                            padding-right: 0;
                            margin-left: 4rem;
                            border: 0;
                        }

                        .customSelect {
                            left: 0;

                            .selectArrowDown {
                                &.disabled {
                                    color: rgba(0, 0, 0, 0.25);
                                }
                            }
                        }
                    }

                    &.disabled {
                        &::after {
                            background-color: rgba(0, 0, 0, 0.10);
                        }

                        .customSelect {
                            .selectArrowDown {
                                color: rgba(0, 0, 0, 0.25);
                            }
                        }
                    }

                    input {
                        padding-right: 4rem;
                    }

                    .customSelect {
                        position: absolute;
                        right: 0;
                        top: 45%;
                        transform: translateY(-50%);
                        width: 66px;

                        select {
                            border: 0;
                            padding-left: 1rem;
                            background-color: unset;
                        }

                        .selectArrowDown {
                            right: 0;
                        }
                    }
                }
            }
        }
    }

    .viewRecord {
        width: 100%;
        border-radius: 8px;
        border: 1px solid rgba(0, 0, 0, 0.10);
        margin-bottom: 2rem;

        .searchInfo {
            padding: 1.5rem;
            color: rgba(0, 0, 0, 0.80);

            .indent {
                padding-bottom: .5em;
                padding-left: 1em;

                .label {
                    margin-bottom: unset;
                    margin-top: unset !important;
                    font-weight: unset;
                }
            }

            .label {
                margin-bottom: .25em;
                display: inline-block;
                font-size: 14px;
                font-weight: 700;

                &:not(:first-child) {
                    margin-top: 1em;
                }

                margin-right: 1em;

                &+.data {
                    display: inline-block;
                    font-size: 0.7rem;
                }
            }

        }

        .recordForm,
        .createForm {
            position: relative;
            display: flex;
            flex-wrap: nowrap;

            &::after {
                position: absolute;
                content: '';
                left: 50%;
                top: 40px;
                width: 1px;
                height: calc(100% - 40px);
                transform: translateX(-50%);
                background: rgba(0, 0, 0, 0.1);
                box-shadow: 0px 1px 3px rgba(0, 0, 0, 0.06);
            }

            .recordInfo,
            .recordData {
                width: 50%;
                overflow: hidden;
                padding-bottom: 1rem;

                .content {
                    &.disabled {
                        opacity: 0.5;
                    }
                }
            }

            .recordData {
                .header {
                    padding-left: 2rem;

                    .tit {
                        min-width: 84px;
                        padding-left: 0;
                        font-weight: 400;
                    }
                }
            }

            .menu {
                position: absolute;
                right: 14px;
                top: 7.5px;
                cursor: pointer;
            }

            .editBtnWrap {
                position: absolute;
                right: 20px;
                top: -2px;

                &.smallver {
                    top: 8px;

                    .cancel {
                        margin-right: 6px;
                    }
                }

                button {
                    position: relative;
                    font-size: 0.8rem;
                    font-weight: 700;
                    border: 0;
                    padding: 0;
                    background-color: unset;
                    cursor: pointer;

                    &.cancel {
                        color: rgba(0, 0, 0, 0.80);
                        margin-right: 1rem;
                    }

                    &.save {
                        color: #293FE6;
                    }

                    &::after {
                        position: absolute;
                        content: '';
                        top: 50%;
                        left: 50%;
                        width: 24px;
                        height: 24px;
                        padding: 4px;
                        transform: translate(-50%, -50%);
                        border-radius: 50%;
                        background-color: #293FE61A;
                        display: none;
                    }
                    &:hover::after {
                        display: block;
                    }
                }
            }

            .editMenuWrap {
                position: absolute;
                right: 0;
                bottom: -130px;
                z-index: 10;

                .editMenu {
                    width: 100px;
                    display: flex;
                    flex-wrap: nowrap;
                    align-items: center;
                    cursor: pointer;

                    &:first-child {
                        margin-bottom: 1rem;
                    }

                    &:hover {
                        span {
                            font-weight: 700;
                        }
                    }

                    span {
                        margin-left: 10px;
                        font-size: 0.8rem;
                        font-weight: 500;
                    }
                }
            }

            .editMenuWrap_v2 {
                position: absolute;
                right: 20px;
                bottom: 20px;
                border-radius: 50%;
                background-color: #293FE6;
                color: #fff;
                padding: 7px;
                cursor: pointer;
                display: none;
            }

            .header {
                position: relative;
                height: 40px;

                &::after {
                    position: absolute;
                    content: '';
                    left: 0;
                    top: 40px;
                    width: 100%;
                    height: 1px;
                    background: rgba(0, 0, 0, 0.1);
                    box-shadow: 0px 1px 3px rgba(0, 0, 0, 0.06);
                }

                .tit {
                    min-width: 84px;
                    height: 40px;
                    line-height: 40px;
                    margin-right: 20px;
                    display: inline-block;
                    color: rgba(0, 0, 0, 0.40);
                    font-size: 0.7rem;
                    font-weight: 700;
                    padding-left: 1rem;

                    &:first-child {
                        min-width: 40px;
                        text-align: center;
                    }
                    
                    &:last-child {
                        margin-right: 0;
                    }

                    &.small {
                        font-weight: 700;
                        display: none;
                    }
                }
            }

            .content {
                height: 404px;
                padding: 0.8rem 1rem 0 1rem;
                overflow: auto;

                .info,
                .smallInfo {
                    position: relative;

                    .label,
                    .smallLabel {
                        display: inline-block;
                        vertical-align: middle;
                        color: rgba(0, 0, 0, 0.40);
                        font-size: 0.7rem;
                    }

                    .value,
                    .smallValue {
                        display: inline-block;
                        vertical-align: middle;
                        font-size: 0.7rem;
                        font-weight: 500;
                        white-space: nowrap;
                        overflow: hidden;
                        text-overflow: ellipsis;
                        color: rgba(0, 0, 0, 0.6);

                        &.disabled {
                            color: rgba(0, 0, 0, 0.25);
                        }

                        &.various {
                            display: block;
                            width: 100%;
                        }

                        input {
                            color: rgba(0, 0, 0, 0.60);
                            background-color: unset;
                            border: 0;
                            border-bottom: 1px solid rgba(0, 0, 0, 0.80);
                            padding: 1px 4px;
                        }

                        select {
                            color: rgba(0, 0, 0, 0.60);
                            background-color: unset;
                            border: 0;
                            border-bottom: 1px solid rgba(0, 0, 0, 0.80);
                            cursor: pointer;
                        }
                    }

                    .tagsWrapper {
                        width: 100%;
                        white-space: nowrap;
                        overflow: hidden;
                        text-overflow: ellipsis;
                        height: 20px;
                        cursor: pointer;

                        .tag {
                            display: inline-block;
                            height: 20px;
                            border-radius: 4px;
                            background: rgba(0, 0, 0, 0.05);
                            box-shadow: 0px -1px 1px 0px rgba(0, 0, 0, 0.15) inset;
                            padding: 2px 8px;
                            margin-right: 8px;
                            text-align: center;
                            font-weight: 500;
                            color: rgba(0, 0, 0, 0.6);
                        }
                    }

                    .copy {
                        position: absolute;
                        // top: -2px;
                        right: 0;
                        display: inline;
                        color: rgba(0, 0, 0, 0.6);
                        cursor: pointer;

                        svg {
                            width: 20px;
                        }

                        &::after {
                            position: absolute;
                            display: block;
                            top: 50%;
                            right: 25px;
                            transform: translateY(-50%);
                            text-align: center;
                            font-size: 0.6rem;
                            font-weight: 400;
                            color: rgba(0, 0, 0, 0.5);
                            background-color: rgba(250, 250, 250, 0.9);
                            border-radius: 4px;
                            padding: 4px;
                            content: "Copied";
                            transition: opacity .4s;
                            display: none;
                        }

                        &.copied::after {
                            display: block;
                        }
                    }
                }

                .info {
                    position: relative;
                    margin-bottom: 12px;

                    .label {
                        width: 150px;
                        font-weight: 700;
                    }

                    .value {
                        width: calc(100% - 150px);

                        input,
                        select {
                            width: 100%;
                        }
                    }

                    // &:nth-child(8) {
                    //     margin-bottom: 42px;
                    // }

                    .que {
                        position: absolute;
                        left: 148px;
                        top: 0;
                        width: 20px;
                        height: 20px;
                        color: rgba(0, 0, 0, 0.60);
                        cursor: pointer;
                    }
                }

                .hidden {
                    position: absolute;
                    background-color: #FAFAFA;
                    border: 1px solid rgba(0, 0, 0, 0.15);
                    box-shadow: 8px 12px 36px rgba(0, 0, 0, 0.10);
                    border-radius: 8px;
                    z-index: 10;
                    font-size: 14px;
                    color: rgba(0, 0, 0, 0.60);

                    &.userID {
                        left: 170px;
                        top: 176px;
                        padding: 20px;
                        font-weight: 700;
                    }

                    &.tags {
                        width: 270px;
                        left: 45%;
                        bottom: 0;
                        padding: 16px;
                        display: flex;
                        flex-wrap: wrap;

                        .tag {
                            height: 20px;
                            border-radius: 4px;
                            background: rgba(0, 0, 0, 0.05);
                            box-shadow: 0px -1px 1px 0px rgba(0, 0, 0, 0.15) inset;
                            padding: 2px 8px;
                            margin: 4px 4px;
                            text-align: center;
                            font-weight: 500;
                            color: rgba(0, 0, 0, 0.6);
                        }
                    }
                }

                .smallInfo {
                    margin-top: 12px;

                    .smallLabel {
                        width: 140px;
                        font-weight: 400;
                        // margin-left: 10px;
                        padding-left: 10px;
                    }

                    .smallValue {
                        width: calc(100% - 140px);
                        padding-left: 10px;

                        input,
                        select {
                            width: 100%;
                        }

                        &.indexValue {
                            width: calc(100% - 200px);
                        }
                    }

                    .typeValue {
                        // width: calc(100% - 10px);
                        border-bottom: 1px solid rgba(0, 0, 0, 0.80);

                        input,
                        select {
                            width: calc(100% - 95px) !important;
                            border-bottom: 0;
                        }

                        select {
                            &:first-child {
                                width: 84px !important;
                                margin-right: 10px;
                            }

                            cursor: pointer;
                        }
                    }
                }

                .row {
                    position: relative;
                    height: 2rem;
                    padding: 0 20px;
                    border-radius: 4px;
                    font-size: 0.7rem;
                    color: rgba(0, 0, 0, 0.60);
                    font-weight: 500;
                    display: flex;
                    flex-wrap: nowrap;
                    align-items: center;
                    cursor: pointer;

                    &:first-child {
                        margin-top: -12px;
                    }

                    &:nth-child(2n) {
                        background: rgba(0, 0, 0, 0.05);
                    }

                    &.empty:hover {
                        cursor: default;
                    }

                    &.disabled:hover {
                        color: rgba(0, 0, 0, 0.40);
                        font-weight: 500;
                        cursor: default;
                    }

                    &.file:hover {
                        .download {
                            display: block;
                        }
                    }

                    &:hover {
                        color: rgba(0, 0, 0, 0.80);
                        font-weight: 700;
                    }

                    .download {
                        position: absolute;
                        right: 3px;
                        top: 50%;
                        transform: translateY(-50%);
                        display: none;
                    }
                }

                .rowEdit {
                    position: relative;
                    padding-left: 20px;
                    margin-bottom: 12px;
                    border-radius: 4px;
                    font-size: 14px;
                    color: rgba(0, 0, 0, 0.60);
                    font-weight: 500;
                    display: flex;
                    flex-wrap: nowrap;
                    // align-items: center;

                    .minus {
                        position: absolute;
                        left: -8px;
                        top: 50%;
                        width: 20px;
                        height: 20px;
                        transform: translateY(-50%);
                        color: rgba(0, 0, 0, 0.60);
                        cursor: pointer;
                    }

                    .type,
                    .key,
                    .context {
                        position: relative;
                        border: 0;
                        background-color: unset;
                    }

                    .type {
                        width: 84px;
                        margin-right: 20px;
                    }

                    .key {
                        width: 84px;
                        margin-right: 20px;
                        border-bottom: 1px solid rgba(0, 0, 0, 0.80);
                        padding: 1px 4px;
                    }

                    .context {
                        width: calc(100% - 208px);
                        border-bottom: 1px solid rgba(0, 0, 0, 0.80);
                        padding: 1px 4px;

                        &.disabled {
                            color: rgba(0, 0, 0, 0.25);
                            font-size: 14px;
                            font-weight: 500;
                            border-bottom: 0;
                        }

                        &.fileUpload {
                            color: #293FE6;
                            font-size: 14px;
                            font-weight: 500;
                            border-bottom: 0;
                            cursor: pointer;
                        }

                        &.click {
                            cursor: pointer;
                        }

                        .overflow {
                            width: 100%;
                            white-space: nowrap;
                            overflow: hidden;
                            text-overflow: ellipsis;
                            display: block;
                        }
                    }

                    select {
                        cursor: pointer;
                    }

                    input {
                        color: rgba(0, 0, 0, 0.60);
                    }
                }

                .data {
                    height: 40px;
                    line-height: 40px;
                    margin-right: 20px;
                    display: inline-block;

                    &:first-child {
                        width: 40px;
                        text-align: center;
                        flex-shrink: 0;
                    }

                    &:nth-child(2) {
                        width: 84px;
                        flex-shrink: 0;
                    }

                    &:nth-child(3) {
                        width: calc(100% - 208px);
                        margin-right: 0;
                        flex-shrink: 1;
                        overflow: hidden;
                    }

                    .material-symbols-outlined {
                        vertical-align: middle;
                    }

                    .overflow {
                        width: 100%;
                        white-space: nowrap;
                        overflow: hidden;
                        text-overflow: ellipsis;
                        display: block;
                    }
                }

                .addDataRow {
                    text-align: center;
                    padding: 6px 0;
                    color: #293FE6;
                    background-color: rgba(41, 63, 230, 0.05);
                    border-radius: 4px;
                    font-size: 0.7rem;
                    font-weight: 500;
                    cursor: pointer;

                    span {
                        margin-left: 8px;
                    }
                }

                .noData {
                    // position: absolute;
                    // left: 75%;
                    // top: 50%;
                    // transform: translate(-50%, -50%);
                    text-align: center;
                    font-size: 28px;
                    font-weight: 700;
                    color: rgba(0, 0, 0, 0.4);

                    .big {
                        width: 52px;
                        height: 52px;
                        font-size: 52px;
                        margin-bottom: 5px;
                    }
                }
            }
        }

        .createForm {
            .header {
                .tit {
                    color: #293FE6;
                    font-size: 0.8rem;
                    font-weight: 700;
                }
            }

            .content {
                .info {
                    padding-right: 2px;

                    &:last-child {
                        margin-bottom: 2.1rem;
                    }
                }
            }
        }

        .noSelect {
            min-height: 100px;
            text-align: center;
            line-height: 100px;
            color: rgba(0, 0, 0, 0.40);
            font-size: 0.8rem;
            font-weight: 500;
        }
    }

    .tableHeader {
        display: flex;
        flex-wrap: nowrap;
        justify-content: space-between;

        .actions {
            position: relative;
            display: flex;
            flex-wrap: nowrap;
            align-items: center;

            .refresh {
                margin-right: 1rem;
                color: rgba(0, 0, 0, 0.6);
            }

            .create {
                margin-right: 1rem;
                color: #293FE6;
            }

            .menu {
                position: relative;
            }

            .dropDown {
                display: flex;
                align-items: center;
                font-size: 0.8rem;
                font-weight: 500;
                margin-right: 1rem;
            }

            .filterWrap {
                position: absolute;
                left: 0;
                bottom: -330px;
                padding: 1rem;
                border-radius: 8px;
                border: 1px solid rgba(0, 0, 0, 0.15);
                background: #FAFAFA;
                box-shadow: 8px 12px 36px 0px rgba(0, 0, 0, 0.10);
                z-index: 10;

                .filter {
                    display: flex;
                    align-items: center;
                    margin-bottom: 0.8rem;
                    color: rgba(0, 0, 0, 0.80);

                    &:last-child {
                        margin-bottom: 0;
                    }

                    input {
                        width: 20px;
                        height: 20px;
                        margin-right: 0.6rem;
                    }
                }
            }

            .recordSettingWrap {
                position: absolute;
                left: 0;
                top: 40px;
                z-index: 10;

                .setting {
                    display: flex;
                    align-items: center;
                    width: 100px;
                    font-size: 0.8rem;

                    &:hover {
                        span {
                            font-weight: 700;
                        }
                    }

                    span {
                        margin-left: 0.7rem;
                    }
                }
            }
        }

        .pagenator {
            display: flex;
            flex-wrap: nowrap;
            align-items: center;

            .prevPage {
                margin-right: 1rem;
            }

            svg {
                cursor: pointer;
            }
        }
    }

    .tableWrap {
        position: relative;
        min-height: 660px;
        margin: 2rem 0;
        overflow: auto;

        .noRecords,
        .noRecordsFound {
            position: absolute;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
            text-align: center;
            color: rgba(0, 0, 0, 0.40);

            .tit {
                display: flex;
                flex-wrap: nowrap;
                align-items: center;
                justify-content: center;

                .material-symbols-outlined {
                    margin-right: 0.6rem;
                }
            }

            p {
                font-weight: 500;
                margin-top: 1.4rem;
            }
        }

        table {
            border-collapse: collapse;
            table-layout: fixed;

            .featureWrap {
                position: relative;
                width: 100%;
                display: flex;
                flex-wrap: nowrap;

                .hoverWrap {
                    width: 31%;
                    margin-right: 3%;

                    &:last-child {
                        margin-right: 0;
                    }
                }

                .feature {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    height: 24px;
                    border-radius: 4px;
                    box-shadow: 0px -1px 1px 0px rgba(0, 0, 0, 0.15) inset;
                    padding-right: 0;
                    color: #fff;
                    cursor: pointer;

                    &.tag {
                        background: #FCA642;
                    }

                    &.index {
                        background: #52D687;
                    }

                    &.ref {
                        background: #B881FF;
                        margin-right: 0;
                    }
                }

                .empty {
                    width: 100%;
                }
            }

            tr {
                height: 60px;
                border-bottom: 1px solid rgba(0, 0, 0, 0.10);
                border-radius: 8px;
                overflow: hidden;

                &.active {
                    background-color: rgba(41, 63, 230, 0.05);
                }

                &:hover {
                    background-color: rgba(41, 63, 230, 0.05);
                }
            }

            thead {
                color: rgba(0, 0, 0, 0.40);
                font-weight: 700;
                text-align: left;

                tr {
                    &:hover {
                        background-color: unset;
                    }

                    th {
                        font-size: 0.7rem;
                        font-weight: 500;
                        white-space: nowrap;

                        &.center {
                            text-align: center;
                        }
                    }
                }
            }

            tbody {
                color: rgba(0, 0, 0, 0.80);
                font-weight: 400;

                tr {
                    cursor: pointer;

                    td {
                        position: relative;
                        white-space: nowrap;
                        
                        > div {
                            font-size: 0.8rem;
                            padding-right: 1rem;
                        }

                        &.center, &:last-child {
                            > div {
                                padding-right: 0;
                            }
                        }

                        &.center {
                            text-align: center;

                            h6 {
                                padding-right: 0;
                            }
                        }
    
                        .accessWrap {
                            * {
                                cursor: pointer;
                            }
                        }
    
                        .featurePreview,
                        .accessPreview {
                            position: absolute;
                            left: 0;
                            top: -33px;
    
                            .preview {
                                position: relative;
                                height: 44px;
                                background-color: #fafafa;
                                border-radius: 8px;
                                box-shadow: 1px 2px 2px rgba(0, 0, 0, 0.25);
                                color: rgba(0, 0, 0, 0.60);
                                font-size: 0.7rem;
                                padding: 0 12px;
                                font-weight: 700;
                                display: none;
    
                                &::after {
                                    position: absolute;
                                    content: '';
                                    left: 2vw;
                                    top: 50%;
                                    border-top: 20px solid transparent;
                                    border-right: 20px solid transparent;
                                    border-left: 20px solid #fafafa;
                                    rotate: -45deg;
                                }
    
                                &.active {
                                    display: block;
                                }
    
                                &.fir {
                                    left: 10%;
                                }
    
                                &.sec {
                                    left: 50%;
                                }
    
                                &.last {
                                    left: 90%;
                                }
    
                                div {
                                    width: 150px;
                                    line-height: 44px;
                                    white-space: nowrap;
                                    text-overflow: ellipsis;
                                    overflow: hidden;
                                    display: none;
    
                                    &.active {
                                        display: block;
                                    }
                                }
                            }
                        }
    
                        .accessPreview {
                            .preview {
                                &::after {
                                    left: 50%;
                                }
    
                                div {
                                    width: 100px;
                                }
                            }
                        }
                    }
                }
            }

            input {
                width: 20px;
                height: 20px;
                margin-left: 2rem;
            }
        }
    }
}

.tagsWrapper_ext {
    width: 100%;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    height: 20px;
    cursor: pointer;

    .tag {
        display: inline-block;
        height: 20px;
        border-radius: 4px;
        background: rgba(0, 0, 0, 0.05);
        box-shadow: 0px -1px 1px 0px rgba(0, 0, 0, 0.15) inset;
        padding: 2px 8px;
        margin-right: 8px;
        text-align: center;
        font-weight: 500;
        color: rgba(0, 0, 0, 0.6);

        &:last-child {
            margin-right: 0;
        }
    }
}

@media (max-width:1023px) {
    #database {
        .advancedForm {
            .condition {
                .textFormWrap {
                    width: 100%;
                    margin-top: 0.7rem;
                }
            }
        }

        .viewRecord {
            .recordForm,
            .createForm {
                flex-wrap: wrap;

                .recordInfo,
                .recordData {
                    width: 100%;
                }

                &::after {
                    position: absolute;
                    content: '';
                    left: 50%;
                    top: 50%;
                    width: 100%;
                    height: 1px;
                    transform: translate(-50%, -50%);
                    background: rgba(0, 0, 0, 0.1);
                    box-shadow: 0px 1px 3px rgba(0, 0, 0, 0.06);
                }

                .menu {
                    // display: none;
                }
                .editMenuWrap_v2 {
                    display: block;
                }
                .recordData {
                    .header {
                        padding-left: 20px;
                        .tit {
                            display: none;
                            &.small {
                                display: block;
                            }
                        }
                    }
                }

                .content {
                    .row {
                        height: unset;
                        flex-wrap: wrap;
                    }
                    .data {
                        width: 100% !important;

                        &:first-child {
                            text-align: left;
                        }
                    }
                    .hidden {
                        &.tags {
                            left: unset;
                            bottom: unset;
                            right: 0;
                            top: 50%;
                            transform: translateY(-50%);
                        }
                    }
                }
            }
        }
    }
}

@media (max-width:767px) {
    #database {
        .advancedForm {
            > div {
                width: 100%;
            }
            .left {
                margin-right: 0;
            }
            .right {
                .title {
                    display: none;
                }
            }
        }
        .searchForm {
            flex-wrap: wrap;

            .selectBar {
                width: 100%;
                margin-right: 0;
                margin-bottom: 1rem;
            }
            .searchBar {
                width: 100%;
            }
        }
        .viewRecord {
            .recordForm,
            .createForm {
                .content {
                    .info {
                        // &:last-child {
                        //     .value {
                        //         width: 100% !important;
                        //         margin-top: 1rem;
                        //     }
                        // }
                        .label {
                            width: 100%;
                        }
                        .value {
                            width: unset !important;

                            &.tags {
                                width: 100% !important;
                                margin-top: 1rem;
                            }
                        }
                    }
                    .smallInfo {
                        .smallValue {
                            width: unset !important;
                        }
                    }
                }
            }
        }
    }
}
</style>
