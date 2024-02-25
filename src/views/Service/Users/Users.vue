<template lang="pug">
main#users
    section#section
        form(@submit.prevent="searchUsers")
            .selectBar
                .customSelect
                    select(:value="searchFor" @change="searchForChange")
                        option(value="timestamp") Date Created
                        option(value="user_id") User ID
                        option(value="email") Email
                        option(value="phone_number") Phone
                        option(value="address") Address
                        option(value="gender") Gender
                        option(value="name") Name
                        option(value="locale") Locale
                        option(value="birthdate") Birth Date
                    .material-symbols-outlined.mid.search.selectArrowDown arrow_drop_down
            .searchBar
                .material-symbols-outlined.mid.search search
                input#searchInput(v-if="searchFor === 'timestamp'" placeholder="YYYY-MM-DD ~ YYYY-MM-DD" v-model="searchText")
                input#searchInput(
                    v-else-if="searchFor === 'user_id'" 
                    placeholder="Search Users" 
                    v-model="searchText"
                    @input="e=>{e.target.setCustomValidity('');}"
                    pattern="[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}"
                )
                input#searchInput(v-else-if="searchFor === 'email'" placeholder="Search public email address" v-model="searchText")
                input#searchInput(v-else-if="searchFor === 'phone_number'" placeholder="eg+821234567890" v-model="searchText")
                input#searchInput(v-else-if="searchFor === 'address'" placeholder="Address" v-model="searchText")
                input#searchInput(v-else-if="searchFor === 'gender'" placeholder="Gender" v-model="searchText")
                input#searchInput(v-else-if="searchFor === 'name'" placeholder="Name" v-model="searchText")
                input#searchInput(v-else-if="searchFor === 'locale'" placeholder="2 digit country code e.g. KR" v-model="searchText")
                input#searchInput(v-else-if="searchFor === 'birthdate'" placeholder="YYYY-MM-DD ~ YYYY-MM-DD" v-model="searchText")
                input(hidden type='submit')
                .material-symbols-outlined.mid.delete(v-if="searchText" @click="e=>{searchText = ''; if(fetchParams.searchFor !== 'timestamp') { fetchParams = defaultFetchParams; refresh(); }}") close
                .material-symbols-outlined.mid.modalIcon(v-if="(searchFor === 'timestamp' || searchFor === 'birthdate') && !searchText" @click.stop="showCalendar = !showCalendar") calendar_today
                .material-symbols-outlined.mid.modalIcon(v-if="searchFor === 'locale' && !searchText" @click.stop="showLocale = !showLocale") arrow_drop_down
    
    section#section(style="overflow: hidden;")
        .tableHeader 
            .actions 
                .dropDown(@click.stop="showFilter = !showFilter")
                    span Headers
                    .material-symbols-outlined.mid arrow_drop_down
                    #moreVert(v-if="showFilter" @click.stop style="--moreVert-left: 0")
                        .inner
                            .filter 
                                .customCheckBox
                                    input#userID(type="checkbox" :checked="filterOptions.userID" @change="filterOptions.userID = !filterOptions.userID")
                                    label(for="userID")
                                        .material-symbols-outlined.mid.check check
                                        span User ID
                            .filter 
                                .customCheckBox
                                    input#name(type="checkbox" :checked="filterOptions.name" @change="filterOptions.name = !filterOptions.name")
                                    label(for="name")
                                        .material-symbols-outlined.mid.check check
                                        span Name
                            .filter 
                                .customCheckBox
                                    input#block(type="checkbox" :checked="filterOptions.block" @change="filterOptions.block = !filterOptions.block")
                                    label(for="block")
                                        .material-symbols-outlined.mid.check check
                                        span Block/Unblock
                            .filter 
                                .customCheckBox
                                    input#status(type="checkbox" :checked="filterOptions.status" @change="filterOptions.status = !filterOptions.status")
                                    label(for="status")
                                        .material-symbols-outlined.mid.check check
                                        span Status
                            .filter 
                                .customCheckBox
                                    input#email(type="checkbox" :checked="filterOptions.email" @change="filterOptions.email = !filterOptions.email")
                                    label(for="email")
                                        .material-symbols-outlined.mid.check check
                                        span Email
                            .filter 
                                .customCheckBox
                                    input#address(type="checkbox" :checked="filterOptions.address" @change="filterOptions.address = !filterOptions.address")
                                    label(for="address")
                                        .material-symbols-outlined.mid.check check
                                        span Address
                            .filter 
                                .customCheckBox
                                    input#gender(type="checkbox" :checked="filterOptions.gender" @change="filterOptions.gender = !filterOptions.gender")
                                    label(for="gender")
                                        .material-symbols-outlined.mid.check check
                                        span Gender
                            .filter 
                                .customCheckBox
                                    input#locale(type="checkbox" :checked="filterOptions.locale" @change="filterOptions.locale = !filterOptions.locale")
                                    label(for="locale")
                                        .material-symbols-outlined.mid.check check
                                        span Locale
                            //- .filter 
                            //-     .customCheckBox
                            //-         input#group(type="checkbox" :checked="filterOptions.access_group" @change="filterOptions.access_group = !filterOptions.access_group")
                            //-         label(for="group")
                            //-             .material-symbols-outlined.mid.check check
                            //-             span Group
                            .filter 
                                .customCheckBox
                                    input#timestamp(type="checkbox" :checked="filterOptions.timestamp" @change="filterOptions.timestamp = !filterOptions.timestamp")
                                    label(for="timestamp")
                                        .material-symbols-outlined.mid.check check
                                        span Date Created
                .material-symbols-outlined.mid.refresh(@click='refresh' :class='{"rotate_animation": fetching }' title="refresh") cached
                .material-symbols-outlined.mid.create(:class="{'nonClickable' : !account.email_verified || currentService.active == 0}" @click="!account.email_verified ? false : inviteUserShow=true" title="invite User") mail
                .material-symbols-outlined.mid.create(:class="{'nonClickable' : !account.email_verified || currentService.active == 0}" @click="!account.email_verified ? false : createUserShow=true" title="create User") person_add
                .menu(:class='{"nonClickable": !checkedUsers.length || !account.email_verified || currentService.active == 0}' @click.stop="!account.email_verified ? false : showUserSetting = !showUserSetting" title="menu")
                    .material-symbols-outlined.mid.clickable more_vert
                    #moreVert(v-if="showUserSetting" @click.stop style="--moreVert-left: 0")
                        .inner
                            .more(@click="()=>{stateText='Block'; showBlockUser=true; showUserSetting=false;}")
                                .material-symbols-outlined.mid account_circle_off
                                span Block
                            .more(@click="()=>{stateText='Unblock'; showUnblockUser=true; showUserSetting=false;}")
                                .material-symbols-outlined.mid account_circle
                                span Unblock
                            .more(@click="()=>{stateText='Delete'; showDeleteUser = true; showUserSetting = false;}")
                                .material-symbols-outlined.mid delete
                                span Delete
            .pagenator 
                .material-symbols-outlined.sml.prevPage.clickable(:class='{"nonClickable": currentPage === 1 || fetching }' @click='e=>{currentPage--; nextTick(selectNone)}' title="prev page") arrow_back_ios
                .material-symbols-outlined.sml.nextPage.clickable(:class='{"nonClickable": maxPage <= currentPage && userPage?.endOfList || fetching }' @click='nextPage' title="next page") arrow_forward_ios
        br
        br
        .tableWrap 
            table#resizeMe.table
                thead
                    tr
                        th(style="width:20px;" :class='{nonClickable: users === null || !users.length}')
                            .customCheckBox
                                input#allUsers(type="checkbox" value='selectall' @click="selectAll")
                                label(for="allUsers")
                                    .material-symbols-outlined.mid.check check
                        th.th.center(v-if="filterOptions.block" style="width:70px;")
                            | Block
                            .resizer(@mousedown="mousedown")
                        th.th.center(v-if="filterOptions.status" style="width:70px;")
                            | Status
                            .resizer(@mousedown="mousedown")
                        th.th(v-if="filterOptions.userID" style="width:360px;")
                            | User ID
                            .resizer(@mousedown="mousedown")
                        th.th(v-if="filterOptions.name" style="width:160px;")
                            | Name
                            .resizer(@mousedown="mousedown")
                        th.th(v-if="filterOptions.email" style="width:160px;")
                            | Email
                            .resizer(@mousedown="mousedown")
                        th.th(v-if="filterOptions.address" style="width:160px;")
                            | Address
                            .resizer(@mousedown="mousedown")
                        th.th(v-if="filterOptions.gender" style="width:160px;")
                            | Gender
                            .resizer(@mousedown="mousedown")
                        //- th.th(v-if="filterOptions.access_group" style="width:160px;")
                        //-     | Group
                        //-     .resizer(@mousedown="mousedown")
                        th.th(v-if="filterOptions.locale" style="width:160px;")
                            | Locale
                            .resizer(@mousedown="mousedown")
                        th.th(v-if="filterOptions.timestamp" style="width:160px;")
                            | Date Created
                            .resizer(@mousedown="mousedown")
                tbody(v-if="users && users.length")
                    tr(v-for="(user, index) in users" :key="index" @click="userCheckConfirm(user)")
                        td(style="min-width:20px")
                            .customCheckBox
                                input(type="checkbox" name="user" :id="user.user_id" @change='trackSelectedUsers' :value="user.user_id")
                                label(:for="user.user_id")
                                    .material-symbols-outlined.mid.check check
                        td.center(v-if="filterOptions.block")
                            .material-symbols-outlined.mid.block(v-if="user.approved.includes('suspended')") no_accounts
                            .material-symbols-outlined.mid.unblock(v-else) account_circle
                        td.center(v-if="filterOptions.status")
                            .material-symbols-outlined.mid.enable(v-if="user.access_group > 0") check_circle
                            .material-symbols-outlined.mid.disable(v-else) cancel
                        td(v-if="filterOptions.userID") 
                            .overflow {{ user.user_id }}
                        td(v-if="filterOptions.name")
                            .overflow {{ user.name }}
                        td(v-if="filterOptions.email")
                            .overflow {{ user.email }}
                        td(v-if="filterOptions.address") 
                            .overflow {{ user.address }}
                        td(v-if="filterOptions.gender")
                            .overflow {{ user.gender }}
                        td(v-if="filterOptions.locale")
                            .overflow {{ Countries[user.locale].flag }}
                        //- td(v-if="filterOptions.access_group")
                        //-     h6.overflow {{ user.access_group }}
                        td(v-if="filterOptions.timestamp")
                            h6.overflow {{ new Date(user.timestamp).toLocaleString() }}
                    tr(v-if="users.length < 10" v-for="i in (10 - users.length)" :key="'extra-' + i")
            .noUsers(v-if="users !== null && !users.length")
                h3 No Users
                br
                p There are no users matching your search terms.
        br
    Calendar(v-if="showCalendar" @dateClicked="handledateClick" alwaysEmit='true')
    LocaleSelector(v-if="showLocale" @countryClicked="handleCountryClick")
    InviteUserOverlay(v-if='inviteUserShow' @close='(e)=>{inviteUserShow=false;inviteSuccess=e;}')
    CreateUserOverlay(v-if='createUserShow' @close='(e)=>{ createUserShow=false; createSuccess=e; if(e) userPage.insertItems([e]).then(()=>getPage(currentPage)) }')
    UserOverlay(v-if='showBlockUser' @close='userState' :state='stateText' :checkedUsers='checkedUsers')
        p This action will block {{ checkedUsers.length }} user(s) from your service. The user will not be able to access your service anymore.
    UserOverlay(v-if='showUnblockUser' @close='userState' :state='stateText' :checkedUsers='checkedUsers')
        p This action will unblock {{ checkedUsers.length }} user(s) from your service. The user will have access to your service.
    UserOverlay(v-if='showDeleteUser' @close='userState' :state='stateText' :checkedUsers='checkedUsers')
        p This action will delete {{ checkedUsers.length }} user(s) account and all the user's data, This action cannot be undone.
    msgOverlay(v-if='inviteSuccess' @close='inviteSuccess = false' title='Success' :preventBackgroundClick='true')
        p Invitation email has been {{inviteSuccess === true ? 'sent' : 'resent' }} to the user.
        br
        p If the user accepts the invitation email and login, they will appear on your user list.        
        br
        br
        div(style='text-align: right;')
            button.msgButton(@click='inviteSuccess=false') OK
    msgOverlay(v-if='createSuccess' @close='createSuccess = false' title='Success' :preventBackgroundClick='true')
        p A user was successfully created       
        br
        br
        div(style='text-align: right;')
            button.msgButton(@click='createSuccess=false') OK
</template>
    
<script setup>
import { bodyClick } from '@/main.js';
import { currentService, serviceUsers } from '@/data.js';
import { skapi, account } from '@/main.js';
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue';
import Countries from '@/skapi-extensions/js/countries.js';
import Calendar from '@/components/Calendar.vue';
import LocaleSelector from '@/components/LocaleSelector.vue';
import msgOverlay from '@/components/msgOverlay.vue';
import InviteUserOverlay from '@/views/Service/Users/InviteUserOverlay.vue';
import CreateUserOverlay from '@/views/Service/Users/CreateUserOverlay.vue';
import UserOverlay from '@/views/Service/Users/UserOverlay.vue';

import Pager from '@/skapi-extensions/js/pager.js';
const worker = new Worker(
    new URL('@/skapi-extensions/js/pager_worker.js', import.meta.url),
    { type: 'module' }
);

let serviceId = currentService.value.service;
let users = ref(null);
let userPage = null;
let currentPage = ref(1);
let maxPage = ref(1);
let fetching = ref(false);
let searchText = ref('');
let inviteSuccess = ref(false);
let inviteUserShow = ref(false);
let createSuccess = ref(false);
let createUserShow = ref(false);

watch(currentPage, (page) => {
    getPage(page);
});

let defaultFetchParams = {
    service: serviceId,
    searchFor: 'timestamp',
    condition: '<=',
    value: new Date().getTime()
}

let fetchParams = defaultFetchParams

onUnmounted(() => {
    if (fetchParams.searchFor !== 'timestamp' || fetchParams?.condition !== '<=') {
        // remove list if it's not defaultParams
        delete serviceUsers[serviceId];
    }
});

let getPage = (p) => {
    let res = userPage.getPage(p);
    userPage.maxPage = res.maxPage;
    users.value = res.list;
    maxPage.value = res.maxPage;
}

let refresh = () => {
    if (fetching.value) {
        return;
    }
    if (!searchText.value) {
        fetchParams = defaultFetchParams;
        fetchParams.value = new Date().getTime();
    }
    users.value = null;
    serviceUsers[serviceId] = new Pager(worker, {
        id: 'user_id',
        sortBy: fetchParams.searchFor,
        order: fetchParams?.condition?.includes('<') ? 'desc' : 'asc',
        resultsPerPage: 10
    })

    userPage = serviceUsers[serviceId];

    fetching.value = true;
    skapi.getUsers(fetchParams, { limit: 50 }).then(u => {
        if (u.endOfList) {
            userPage.endOfList = true;
        }
        userPage.insertItems(u.list).then(_ => {
            // to avoid watch trigger
            if (currentPage.value === 1) {
                getPage(1);
            }
            else {
                currentPage.value = 1;
            }
            fetching.value = false;
        });
    });
}

if (!serviceUsers?.[serviceId]) {
    refresh();
}
else {
    userPage = serviceUsers[serviceId];
    getPage(currentPage.value);
}

let nextPage = () => {
    if (currentPage.value === maxPage.value && !userPage.endOfList) {
        users.value = null;
        fetching.value = true;
        skapi.getUsers(fetchParams, { fetchMore: true, limit: 50 }).then(u => {
            if (u.endOfList) {
                userPage.endOfList = true;
            }
            userPage.insertItems(u.list).then(_ => {
                currentPage.value++;
                fetching.value = false;
            });
        });
    }

    else {
        currentPage.value++;
    }

    nextTick(selectNone);

}

bodyClick.userPage = () => {
    showUserSetting.value = false;
    showFilter.value = false;
    showCalendar.value = false;
    showLocale.value = false;
    // showDeleteUser.value = false;
}

let searchFor = ref('timestamp');
let showFilter = ref(false);
let showCalendar = ref(false);
let showLocale = ref(false);
let showUserSetting = ref(false);
let showUserState = ref(false);
let stateText = ref('')
let showDeleteUser = ref(false);
let showBlockUser = ref(false);
let showUnblockUser = ref(false);

let filterOptions = ref({
    userID: true,
    name: true,
    block: true,
    status: true,
    email: true,
    address: false,
    gender: false,
    // group: false,
    locale: false,
    timestamp: false
});

let selectAll = (e) => {
    let checkboxes = document.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach((checkbox) => {
        checkbox.checked = e.target.checked
    })
    trackSelectedUsers();
}

let selectNone = () => {
    // page 넘길때 사용
    let checkboxes = document.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach((checkbox) => {
        checkbox.checked = false;
    });
    trackSelectedUsers();
}

let checkedUsers = ref([]);

let trackSelectedUsers = () => {
    let checkboxes = document.querySelectorAll('input[type="checkbox"]');
    let checked = [];
    checkboxes.forEach((checkbox) => {
        if (checkbox.checked && checkbox.value !== 'selectall') {
            checked.push(checkbox.value);
        }
    })
    checkedUsers.value = checked;
}

let userCheckConfirm = (user) => {
    let targetInput = document.getElementById(user.user_id);
    if (targetInput.checked) {
        targetInput.checked = false;
    } else {
        targetInput.checked = true;
    }
    trackSelectedUsers();
}

let userState = async (user) => {
    if(stateText.value == 'Block') {
        showBlockUser.value = false;
    } else if(stateText.value == 'Unblock') {
        showUnblockUser.value = false;
    } else {
        showDeleteUser.value = false;
    }

    if (user) {
        for (let u of user) {
            let to_update = userPage.list[u];

            if(stateText.value == 'Block') {
                to_update.approved = 'by_admin:suspended:'
                await userPage.editItem(to_update);
            } else if(stateText.value == 'Unblock') {
                to_update.approved = 'by_admin:approved:'
                await userPage.editItem(to_update);
            } else {
                await userPage.deleteItem(u);
            }
        }

        selectNone();
        getPage(currentPage.value);
    }
}

let handleCountryClick = (key) => {
    searchText.value = key;
    showLocale.value = false;
    document.querySelector('#searchInput').focus();
}

let handledateClick = (startDate, endDate) => {
    if (startDate == null && endDate == null) {
        searchText.value = ''
        // showCalendar.value = true;
    } else {
        searchText.value = (startDate || '') + ' ~ ' + (endDate || '');
        // showCalendar.value = false;
    }
    document.querySelector('#searchInput').focus();
}

let searchForChange = (e) => {
    searchFor.value = e.target.value;
    searchText.value = '';
    nextTick(() => {
        document.querySelector('#searchInput').focus();
    });
}

let searchUsers = (e) => {
    let search = searchText.value;
    let searchTarget = searchFor.value;

    if (!search) {
        fetchParams = defaultFetchParams;
        refresh();
    }

    else if (searchTarget === 'timestamp') {
        let dates = search.split('~').map(d => d.trim());

        let startDate = 0;
        if (dates?.[0]) {
            let st = new Date(dates[0]).getTime();
            if (!isNaN(st)) {
                startDate = st
            }
        }

        let endDate = Date.now();
        if (dates?.[1]) {
            let ed = new Date(dates[1]).getTime();
            if (!isNaN(endDate)) {
                endDate = ed;
            }
        }

        fetchParams = {
            service: serviceId,
            searchFor: searchTarget,
            value: startDate,
            range: endDate
        }

        refresh();
    }
    else if (searchTarget === 'user_id') {
        fetchParams = {
            service: serviceId,
            searchFor: 'user_id',
            value: search
        }
        refresh();
    }
    else if (searchTarget === 'birthdate') {
        let dates = search.split('~').map(d => d.trim());

        let startDate = dates?.[0] || '1000-01-01';

        let endDate = dates?.[1] || new Date().toISOString().substring(0, 10);

        fetchParams = {
            service: serviceId,
            searchFor: searchTarget,
            value: startDate,
            range: endDate
        }

        refresh();
    }
    else {
        fetchParams = {
            service: serviceId,
            searchFor: searchTarget,
            value: search,
            condition: '>='
        }
        refresh();
    }
}

// table resize
let prevX, prevW, nextW = 0;
let prevCol, nextCol = null;
let mouseMoveHandler = function (e) {
    // let ths = document.getElementsByTagName('th');
    // let thsArr = Array.from(ths);
    // let dx = e.clientX - prevX;
    // let widthSum = 0;

    // thsArr.forEach((e) => {
    //     widthSum += e.offsetWidth - 2;
    // });

    // if ((widthSum < window.innerWidth || dx < 0) && (prevW + dx > 200 && nextW - dx > 200)) {
    //     prevCol.style.width = `${prevW + dx}px`;
    //     nextCol.style.width = `${nextW - dx}px`;
    // }
    let dx = e.clientX - prevX;

    // 현재 이동 중인 컬럼의 너비 변경
    let newPrevWidth = prevW + dx;

    // 최소 너비
    const minColumnWidth = 100;
    if (newPrevWidth < minColumnWidth) {
        return;
    }

    // 현재 이동 중인 컬럼만 위치 이동
    prevCol.style.width = `${newPrevWidth}px`;
};

let mousedown = function (e) {
    prevCol = e.target.parentNode;
    nextCol = prevCol.nextSibling;

    let prevStyles = window.getComputedStyle(e.target.parentNode);
    let nextStyles = window.getComputedStyle(prevCol.nextSibling);

    prevX = e.clientX;
    prevW = parseInt(prevStyles.width, 10);
    nextW = parseInt(nextStyles.width, 10);
    document.addEventListener('mousemove', mouseMoveHandler);
};

document.addEventListener('mouseup', function () {
    document.removeEventListener('mousemove', mouseMoveHandler);
});

onMounted(() => {
    let overflows = document.querySelectorAll('.overflow');
    overflows.forEach(overflow => {
        let scrollWidth = overflow.scrollWidth;
        if (scrollWidth > 120) {
            overflow.parentNode.classList.add('ellipsis');
        }
    });
})
</script>
    
<style lang="less" scoped>
#users {
    max-width: 1200px;
    margin: 0 auto;
    position: relative;

    #calendar,
    #localeSelector {
        position: absolute;
        right: 41px;
        top: 80px;
    }

    #section {
        width: 100%;
        padding: 1.4rem 2rem;
        background-color: #fafafa;
        border-radius: 8px;
        margin-bottom: 2%;
        filter: drop-shadow(0px 2px 4px rgba(0, 0, 0, 0.10));
    }

    form {
        display: flex;
        flex-wrap: nowrap;

        .selectBar {
            width: 200px;
            margin-right: 20px;

            select {
                height: 44px;
                background: rgba(0, 0, 0, 0.05);
                font-size: 0.8rem;
                padding: 0 20px;
                font-weight: 500;
                color: rgba(0, 0, 0, 0.80);
                cursor: pointer;
            }
        }

        .searchBar {
            position: relative;
            width: calc(100% - 220px);

            input {
                width: 100%;
                height: 44px;
                border: 0;
                border-radius: 8px;
                background: rgba(0, 0, 0, 0.05);
                font-size: 0.8rem;
                padding-left: 50px;
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

            .modalIcon {
                position: absolute;
                right: 16px;
                top: 10px;
                color: rgba(0, 0, 0, 0.8);
                cursor: pointer;
            }
        }
    }

    .tableHeader {
        display: flex;
        flex-wrap: nowrap;
        justify-content: space-between;

        .actions {
            display: flex;
            flex-wrap: nowrap;
            align-items: center;

            * {
                cursor: pointer;
            }

            .dropDown {
                position: relative;
                display: flex;
                align-items: center;
                font-size: 0.8rem;
                font-weight: 500;
                margin-right: 1rem;
                color: rgba(0, 0, 0, 0.6);
            }

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
        }

        .pagenator {
            display: flex;
            flex-wrap: nowrap;
            align-items: center;

            .prevPage {
                margin-right: 1rem;
            }
        }
    }

    .tableWrap {
        position: relative;
        min-height: 660px;
        overflow-x: auto;

        .noUsers {
            position: absolute;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
            text-align: center;

            h3 {
                color: rgba(0, 0, 0, 0.40);
            }

            p {
                color: rgba(0, 0, 0, 0.40);
                font-weight: 500;
            }
        }

        table {
            width: 100%;
            border-collapse: collapse;
            table-layout: fixed;

            thead {
                text-align: left;

                tr {
                    height: 60px;

                    th {
                        position: relative;
                        color: rgba(0, 0, 0, 0.40);
                        font-size: 0.7rem;
                        font-weight: 500;
                        padding-left: 20px;

                        &::after {
                            position: absolute;
                            content: '';
                            width: 100%;
                            height: 1px;
                            left: 0;
                            bottom: 0;
                            background: rgba(0, 0, 0, 0.1);
                            box-shadow: 0px 1px 3px 0px rgba(0, 0, 0, 0.06);
                        }

                        &:first-child {
                            padding-left: 0;
                        }

                        &:last-child {
                            .resizer {
                                display: none;
                            }
                        }

                        &.center {
                            padding: 0;
                            text-align: center;
                        }

                        .resizer {
                            position: absolute;
                            top: 50%;
                            right: 0px;
                            transform: translateY(-50%);
                            width: 4px;
                            height: 20px;
                            background-color: rgba(0, 0, 0, 0.1);
                            cursor: col-resize;

                            &.contrast {
                                background-color: #fff !important;
                            }
                        }

                        .resizable {
                            height: 100px;
                            width: 100px;
                            position: relative;
                        }
                    }
                }
            }

            tbody {
                font-weight: 400;

                tr {
                    cursor: pointer;
                }

                td {
                    position: relative;
                    height: 60px;
                    padding-left: 20px;

                    &::after {
                        position: absolute;
                        content: '';
                        width: 100%;
                        height: 1px;
                        left: 0;
                        bottom: 0;
                        background: rgba(0, 0, 0, 0.1);
                        box-shadow: 0px 1px 3px 0px rgba(0, 0, 0, 0.06);
                    }

                    &:first-child {
                        padding-left: 0;
                    }

                    &.center {
                        padding: 0;
                        text-align: center;
                    }

                    > div:not(.material-symbols-outlined) {
                        font-size: 0.8rem;
                    }

                    .block {
                        color: rgba(0, 0, 0, 0.4);
                    }

                    .enable {
                        color: rgba(90, 216, 88, 1);
                    }

                    .disable {
                        color: rgba(240, 78, 78, 1);
                    }

                    .overflow {
                        position: relative;
                        width: 100%;
                        white-space: nowrap;
                        overflow: hidden;
                        text-overflow: ellipsis;

                        &::-webkit-scrollbar {
                            display: none;
                        }
                    }
                }
            }
        }
    }
}

@media (max-width:767px) {
    #users {
        #calendar,
        #localeSelector {
            position: absolute;
            right: 0px;
            top: 136px;
        }

        form {
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
    }
}
</style>

<style lang="less">
button.msgButton {
    padding: 0 28px;
    height: 44px;
    border-radius: 8px;
    border: 2px solid #293FE6;
    background-color: unset;
    color: #293FE6;
    font-size: 16px;
    font-weight: 700;
    cursor: pointer;
}
</style>