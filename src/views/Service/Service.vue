<template lang="pug">
PlanCaution(v-if="(currentService?.subsInfo?.cancel_at_period_end || currentService?.subsInfo?.status == 'unpaid' || currentService?.subsInfo?.status == 'canceled') && showPlanCaution" @close="showPlanCaution = false;")

main#service
    .infoWrap
        .info
            .toggleWrap(:class="{'active': currentService.active >= 1}")
                span Disable/Enable
                .toggleBg(:class="{'nonClickable' : !account?.email_verified}")
                    .toggleBtn(@click="enableDisableToggle")
            .row
                h6 Service Name
                template(v-if="modifyServiceName")
                    form.modifyInputForm(@submit.prevent="changeServiceName" style="display:inline-block; width:unset")
                        .customInput
                            input#modifyServiceName(type="text" placeholder="Service name" :value='inputServiceName' @input="(e) => inputServiceName = e.target.value" required)
                        template(v-if="serviceFetching")
                            img.loading(src="@/assets/img/loading.png")
                        template(v-else)
                            input#submitInp(type="submit" hidden)
                            label.material-symbols-outlined.big.save(for='submitInp') done
                            .material-symbols-outlined.sml.cancel(@click="modifyServiceName = false;") close
                template(v-else)
                    h5.blue {{ currentService.name }}
                    .material-symbols-outlined.mid.modify.clickable(:class="{'nonClickable' : !account?.email_verified || currentService.active == 0}" @click="editServiceName" style="margin-left:10px") edit
            .row
                h6 Service ID 
                h5 {{ currentService.service }}
            .row 
                h6 Date Created
                h5 {{ dateFormat(currentService.timestamp) }}
            .codeWrap
                pre.codeInner.
                    #[span(style="color:#33adff") &nbsp;&nbsp;&nbsp;&nbsp;const] skapi = #[span(style="color:#33adff") new] Skapi(#[span(style="color:#FFED91") "{{ currentService.service }}"], #[span(style="color:#FFED91") "{{ currentService.owner }}"]);
                .copy.clickable(@click="copy")
                    .material-symbols-outlined.mid file_copy
            a.question(href="https://docs.skapi.com/introduction/getting-started.html" target="_blank")
                .material-symbols-outlined.empty.sml help 
                span Where do I put this code?

        .info(:class="{'nonClickable' : !account?.email_verified || currentService.active == 0 || new Date().getTime() < currentService?.subsInfo?.canceled_at}") 
            .title 
                h4 Security Setting
                a.question.help(href='https://docs.skapi.com/security/security-settings.html' target="_blank")
                    .material-symbols-outlined.empty.sml help 
                    span Help
            .listWrap
                .list
                    h6(:class="{ active: modifyCors }") Cors
                    template(v-if="modifyCors")
                        form.modifyInputForm(style="margin-top: 8px" @submit.prevent="changeCors")
                            .customInput
                                input#modifyCors(:disabled="promiseRunningCors || null" type="text" placeholder='https://your.domain.com' :value='inputCors' @input="(e) => {e.target.setCustomValidity(''); inputCors = e.target.value;}")
                            template(v-if="promiseRunningCors")
                                img.loading(src="@/assets/img/loading.png")
                            template(v-else)
                                input#submitInp(type="submit" hidden)
                                label.material-symbols-outlined.big.save(for='submitInp') done
                                .material-symbols-outlined.sml.cancel(@click="modifyCors = false;") close
                    template(v-else)
                        h5.ellipsis(style="width:calc(100% - 30px)") {{ currentService.cors || '*' }}
                        .material-symbols-outlined.mid.pen.clickable(:class="{'nonClickable' : !account?.email_verified}" @click="editCors") edit

                    h6(:class="{ active: modifyKey }" style="margin-top:1rem") Secret Key
                    template(v-if="modifyKey")
                        form.modifyInputForm(style="margin-top: 8px" @submit.prevent="setSecretKey")
                            .customInput
                                input#modifyKey(:disabled="promiseRunningSecKey || null" type="text" placeholder="Secret key for external request" :value='inputKey' @input="(e) => inputKey = e.target.value")
                            template(v-if="promiseRunningSecKey")
                                img.loading(src="@/assets/img/loading.png")
                            template(v-else)
                                input#submitInp(type="submit" hidden)
                                label.material-symbols-outlined.big.save(for='submitInp') done
                                .material-symbols-outlined.sml.cancel(@click="modifyKey = false;") close
                    template(v-else)
                        h5.ellipsis(style="width:calc(100% - 30px);") {{ currentService.api_key || 'No key' }}
                        .material-symbols-outlined.mid.pen.clickable(:class="{'nonClickable' : !account?.email_verified}" @click="editKey") edit

                .list 
                    h6 Client Secret Key
                    .addBtn(@click="addSecretKey" :class="{'nonClickable' : secretKeyEdit || secretKeyAdd || promiseRunning}")
                        .material-symbols-outlined.sml add 
                        span Add Secret Key
                    .keyWrap(:class="{'nonClickable' : promiseRunning}")
                        template(v-if="clientSecretState.length")
                            template(v-for="(data, index) in clientSecretState" :key="index")
                                form(@submit.prevent="saveSecretKey(index)")
                                    template(v-if="!data.keyEdit && !data.keyAdd")
                                        .key
                                            .inputWrap
                                                #keyName {{ data.key }}
                                                #secretKey {{ data.value.substr(0,4) + '******************************' }}
                                            .buttonWrap
                                                .material-symbols-outlined.mid.edit(@click="editSecretKey(index)" :class="{'none' : secretKeyAdd || secretKeyEdit}") edit
                                    template(v-else)
                                        .key.edit(ref="keyEditForm")
                                            .inputWrap(:class="{'edit' : data.keyEdit}")
                                                .material-symbols-outlined.sml.minus(v-if="data.keyEdit" @click="removeKey(index)") do_not_disturb_on
                                                input#keyName(type="text" v-model="data.key" name='keyName' placeholder="Key name" required)
                                                input#secretKey(type="text" v-model="data.value" name='secretKey' placeholder="Secret Key" required)
                                            .buttonWrap
                                                template(v-if="promiseRunning")
                                                    //- div(style='display: inline-flex;align-items: center;width:108px;height: 43px;')
                                                    img.loading(style='padding:0;width:18px;height:18px;' src="@/assets/img/loading.png")
                                                template(v-else)
                                                    input#submitInp(type="submit" hidden)
                                                    label.material-symbols-outlined.mid.save(for='submitInp') check
                                                    .material-symbols-outlined.mid.cancel(@click="checkKeyInp(index)") close
                        template(v-else)
                            .empty No data

        .info 
            .title 
                h4 Subsription Plan
            .listWrap
                .list(style="width:23.5%;margin-right:2%")
                    h6 Current Plan
                    h5 {{ currentService.group == 2 ? 'Standard' : currentService.group == 3 ? 'Premium' : currentService.group == 50 ? 'Unlimited' : currentService.group == 51 ? 'Free Standard' : 'Trial' }}
                .list(style="width:23.5%;margin-right:2%")
                    h6 State 
                    h5(v-if="currentService?.subsInfo?.cancel_at_period_end" style="color:var(--caution-color)") Canceled
                    h5(v-else-if="currentService?.subsInfo?.cancel_at_period_end && new Date().getTime() < currentService?.subsInfo?.canceled_at" style="color:var(--caution-color)") Suspended
                    h5(v-else) Running
                .list(style="width:23.5%;margin-right:2%")
                    h6 Renew Date
                    template(v-if="currentService.group == 1")
                        h5(style="color:var(--caution-color)") All Data will be deleted by {{ dateFormat(currentService.timestamp + 604800000) }}
                    template(v-else)
                        h5 {{ dateFormat(currentService?.subsInfo?.current_period_end * 1000) }}
                router-link.list(:to='`/subscription/${currentService.service}`' style="width:23.5%;text-align:right") 
                    button.final(v-if="new Date().getTime() < currentService?.subsInfo?.canceled_at") Resume Plan
                    button.final(v-else) Manage Subscription

        .info.card(:class="{'nonClickable' : !account?.email_verified || currentService.active == 0 || new Date().getTime() < currentService?.subsInfo?.canceled_at}") 
            .inner
                .title 
                    .logoTitle
                        .material-symbols-outlined.big group
                        h4 Users
                    router-link.material-symbols-outlined.arrowIcon.mid(:to='`/myServices/${currentService.service}/users`') arrow_forward_ios
                .contWrap.noWrap
                    .cont 
                        h6 # of Users
                        p {{ currentService.users }}
                    .cont(style="width:unset;")
                        h6 Creating User
                        .customSelect
                            select(:value="currentService.prevent_signup ? 'admin' : 'anyone'" @change="(e) => changeCreateUserMode(e)" style="color:var(--main-color);")
                                option(value="admin") Only Admin allowed 
                                option(value="anyone") Anyone allowed
                            .material-symbols-outlined.mid.search.selectArrowDown(style="right:-30px;top:66%;color:var(--main-color);") arrow_drop_down

        .info.card(:class="{'nonClickable' : !account?.email_verified || currentService.active == 0 || new Date().getTime() < currentService?.subsInfo?.canceled_at}") 
            .inner
                .title 
                    .logoTitle
                        .material-symbols-outlined.big database
                        h4 Database
                    router-link.material-symbols-outlined.arrowIcon.mid(:to='`/myServices/${currentService.service}/records`') arrow_forward_ios
                .contWrap.noWrap
                    .cont 
                        h6 # of database storage Used
                        p {{ convertToMb(storageInfo?.[currentService.service]?.database) }}
                    .cont 
                        h6 # of cloud storage Used
                        p {{ convertToMb(storageInfo?.[currentService.service]?.cloud) }}

        .info.card(:class="{'nonClickable' : !account?.email_verified || currentService.active == 0 || currentService.group == 1 || new Date().getTime() < currentService?.subsInfo?.canceled_at}") 
            .inner
                .title 
                    .logoTitle
                        .material-symbols-outlined.big mail
                        h4 Mail
                    router-link.material-symbols-outlined.arrowIcon.mid(:to='`/myServices/${currentService.service}/mail`' :class="{'nonClick' : account.access_group == 1}") arrow_forward_ios
                .contWrap.noWrap
                    template(v-if="account.access_group == 1")
                        .cont(style="width:100%; padding:0;")
                            h6 Trial service does not provide mail.
                    template(v-else)
                        .cont 
                            h6 # Subscribers
                            p {{ currentService.newsletter_subscribers }}
                        .cont 
                            h6 # Mail storage used 
                            p {{ convertToMb(storageInfo?.[currentService.service]?.email) }}

        .info.card(:class="{'nonClickable' : !account?.email_verified || currentService.active == 0 || currentService.group == 1 || new Date().getTime() < currentService?.subsInfo?.canceled_at}") 
            .inner
                .title 
                    .logoTitle
                        .material-symbols-outlined.big language
                        h4 Hosting
                    router-link.material-symbols-outlined.arrowIcon.mid(:to='`/myServices/${currentService.service}/subdomain`' :class="{'nonClick' : account.access_group == 1}") arrow_forward_ios
                .contWrap.noWrap
                    template(v-if="account.access_group == 1")
                        .cont(style="width:100%; padding:0;")
                            h6 Trial service does not provide hosting.
                    template(v-else)
                        .cont 
                            h6 Registered Subdomain
                            p {{ currentSubdomain }}
                        .cont 
                            h6 Host storage used
                            p {{ convertToMb(storageInfo?.[currentService.service]?.host) }}

    br

    section.deleteWrap(v-if="currentService.active < 0 || currentService.group == 1 || currentService.group == 51" :class="{'nonClickable' : !account?.email_verified || currentService.active == 0}")
        h4 Delete Service
        
        br

        ul.desc
            li Deleting the service will permanently erase all data. Recovery is not possible. The service plan will also be immediately canceled, and the remaining days will be prorated and refunded.

        br

        .btn(@click="!account?.email_verified ? false : openDeleteService = true;" style="display:block;text-align:right;")
            button.unFinished.warning Delete Service

DisableServiceOverlay(v-if="openDisableService" @close="disableService")
DeleteService(v-if="openDeleteService" @close="openDeleteService = false;")
</template>

<script setup>
import { computed, nextTick, ref, watch, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { currentService, storageInfo, serviceFetching } from '@/data.js';
import { skapi, account, domain } from '@/main.js';
import DisableServiceOverlay from '@/views/Service/DisableServiceOverlay.vue';
import DeleteService from '@/components/DeleteService.vue';
import PlanCaution from '@/components/PlanCaution.vue';

const router = useRouter();
let convertToMb = (size) => {
    if (size) {
        return (size / (1024 * 1024)).toFixed(2) + ' MB'
    }
    else {
        return '-'
    }
}
let dateFormat = (timestamp) => {
    let currentDate = new Date(timestamp);
    let month = currentDate.getMonth() + 1;
    let day = currentDate.getDate();

    month = month >= 10 ? month : '0' + month;
    day = day >= 10 ? day : '0' + day;

    return currentDate.getFullYear() + '.' + month + '.' + day;
}

let showPlanCaution = ref(false);
let modifyServiceName = ref(false);
let modifyCors = ref(false);
let modifyKey = ref(false);
let openDisableService = ref(false);
let openDeleteService = ref(false);
let inputServiceName = '';
let inputCors = ref('');
let inputKey = '';
let enableDisablePromise = ref(false);
let promiseRunningCors = ref(false);
let promiseRunningSecKey = ref(false);
let promiseRunning = ref(false);
let secretKeyEdit = ref(false);
let secretKeyAdd = ref(false);
let keyEditForm = ref(null);
let clientSecretKey =ref([]);
let clientSecretState =ref([]);
let clientCopy = [];

if(!currentService.value.client_secret) {
    clientSecretKey.value = []
} else {
    clientSecretKey.value = [];
    clientSecretKey.value.push(currentService.value.client_secret); 
    let keys = Object.keys(clientSecretKey.value[0]);
    let values = Object.values(clientSecretKey.value[0]);
    for(let i=0; i<keys.length; i++) {
        clientSecretState.value.push({ key: keys[i], value: values[i], keyAdd : false, keyEdit : false});
    }
}

let addSecretKey = () => {
    clientSecretState.value.unshift({ key: '', value: '', keyEdit: false, keyAdd: true });
    secretKeyAdd.value = true;
    clientCopy = JSON.parse(JSON.stringify(clientSecretState.value));
    nextTick(() => {
        document.getElementById('keyName').focus();
    });
}
let editSecretKey = (index) => {
    clientSecretState.value[index].keyEdit=true;
    secretKeyEdit.value=true;
    clientCopy = JSON.parse(JSON.stringify(clientSecretState.value))
}
let saveSecretKey = (index) => {
    promiseRunning.value = true;
    if(clientSecretState.value.length > 1) {
        if (secretKeyEdit.value && clientCopy[index].key == clientSecretState.value[index].key && clientCopy[index].value == clientSecretState.value[index].value) {
            clientSecretState.value[index].keyEdit=false;
            secretKeyEdit.value=false;
            promiseRunning.value = false;
            return;
        }
    }

    let data = clientSecretState.value;
    let keyValue = {};
    let newVersion = [];
    for(let d of data) {
        keyValue[d.key] = d.value;
        newVersion.push({ key: d.key, value: d.value, keyAdd : false, keyEdit : false});
    }
    clientSecretState.value = newVersion;

    skapi.setServiceOption({
        serviceId: currentService.value.service,
        option: {
            client_secret: keyValue
        }
    }).then(s=>{
        console.log({s});
        for(let i=0; i<clientSecretState.value.length; i++) {
            clientSecretState.value[i].keyAdd = false;
            clientSecretState.value[i].keyEdit = false;
        }
        secretKeyEdit.value = false;
        secretKeyAdd.value = false;
        promiseRunning.value = false;
    });
}
let checkKeyInp = (index) => {
    if(secretKeyEdit.value) {
        console.log(clientCopy[index])

        if(clientCopy[index].key !== clientSecretState.value[index].key || clientCopy[index].value !== clientSecretState.value[index].value) {
            clientSecretState.value[index].key = clientCopy[index].key;
            clientSecretState.value[index].value = clientCopy[index].value;
        }
    } else if(secretKeyAdd.value) {
        clientSecretState.value.splice(index, 1);
        secretKeyEdit.value=false;
        secretKeyAdd.value=false;

        return;
    }
    clientSecretState.value[index].keyEdit=false;
    clientSecretState.value[index].keyAdd=false;
    secretKeyEdit.value=false;
    secretKeyAdd.value=false;
}
let removeKey = (index) => {
    let data = clientSecretState.value[index];
    clientSecretState.value.splice(index, 1);
    secretKeyEdit.value = false;
    saveSecretKey();
}
let currentSubdomain = computed(() => {
    if (currentService.value.subdomain) {
        if (currentService.value.subdomain[0] === '*' || currentService.value.subdomain[0] === '+') {
            // subdomain will start with * or + when in pending state or removal state
            return currentService.value.subdomain.slice(1) + '.' + domain;
        }
        return currentService.value.subdomain + '.' + domain;
    }
    else {
        return 'No subdomain';
    }
});
let editServiceName = () => {
    if (account.value?.email_verified) {
        inputServiceName = currentService.value.name;
        modifyServiceName.value = true;
    } else {
        return false;
    }
}
let editCors = () => {
    if (account.value?.email_verified) {
        inputCors.value = currentService.value.cors === '*' ? '' : currentService.value.cors; modifyCors.value = true;
    } else {
        return false;
    }
}
let editKey = () => {
    if (account.value?.email_verified) {
        inputKey = currentService.value.api_key; modifyKey.value = true;
    } else {
        return false;
    }
}
let copy = (e) => {
    let currentTarget = e.currentTarget;
    // let doc = document.createElement('textarea');
    // doc.textContent = currentTarget.previousSibling.textContent + '\n';
    // document.body.append(doc);
    // doc.select();
    // document.execCommand('copy');
    // doc.remove();
    const range = document.createRange();
    range.selectNode(currentTarget.previousSibling);
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(range);
    document.execCommand('copy');
    window.getSelection().removeAllRanges();

    currentTarget.classList.add('copied');
    setTimeout(() => {
        currentTarget.classList.remove('copied');
    }, 1000);
}

let changeServiceName = () => {
    if (currentService.value.name !== inputServiceName) {
        let previous = currentService.value.name;

        // promiseRunning.value = true;
        serviceFetching.value = true;

        skapi.updateService(currentService.value.service, {
            name: inputServiceName
        }).then(() => {
            // promiseRunning.value = false;
            serviceFetching.value = false;
            currentService.value.name = inputServiceName;
            modifyServiceName.value = false;
        }).catch(err => {
            // promiseRunning.value = false;
            serviceFetching.value = false;
            currentService.value.name = previous;
            throw err;
        });
    } else {
        return false;
    }
}
let changeCors = () => {
    let corsArr = inputCors.value.split(',');
    let corsToUpdate = []
    for (let u of corsArr) {
        u = u.trim().toLowerCase();
        if (u) {
            if (skapi.validate.url(u)) {
                corsToUpdate.push(u);
            }
            else {
                document.getElementById('modifyCors').setCustomValidity('Cors origin should be a valid URL. (Separated with comma) ex) https://your.domain1.com, https://your.domain2.com');
                document.getElementById('modifyCors').reportValidity();
                return;
            }
        }
    }

    promiseRunningCors.value = true;
    corsToUpdate.sort()
    skapi.updateService(currentService.value.service, {
        cors: corsToUpdate.length ? corsToUpdate : ['*']
    }).then(() => {
        promiseRunningCors.value = false;
        modifyCors.value = false;
        currentService.value.cors = corsToUpdate.join(', ');
    }).catch(err => {
        promiseRunningCors.value = false;
        nextTick(() => {
            document.getElementById('modifyCors').focus();
            document.getElementById('modifyCors').setCustomValidity(err.message);
            document.getElementById('modifyCors').reportValidity();
        });
    });
}
let setSecretKey = () => {
    let previous = currentService.value.api_key;
    skapi.updateService(currentService.value.service, {
        api_key: inputKey
    }).catch(err => {
        currentService.value.api_key = previous;
        throw err;
    });

    currentService.value.api_key = inputKey;
    modifyKey.value = false;
}
let enableDisableToggle = () => {
    if (enableDisablePromise.value || !account.value?.email_verified) {
        return;
    }
    if (currentService.value.active === 0) {
        // enable
        enableDisablePromise.value = skapi.enableService(currentService.value.service).catch(err => {
            currentService.value.active = 0;
            throw err;
        }).finally(_ => {
            enableDisablePromise.value = false;
        });;
        currentService.value.active = 1;
    } else {
        // disable (opens disable service dialog)
        openDisableService.value = true;
    }
}
let changeCreateUserMode = (e) => {
    e.target.parentNode.classList.add('nonClickable');

    skapi.setServiceOption({
        serviceId: currentService.value.service, option: {'prevent_signup': e.target.value == 'admin' ? true : false}
    }).then(() => {
        e.target.parentNode.classList.remove('nonClickable');
    }).catch(err => console.log(err));
}
let disableService = (e) => {
    if (enableDisablePromise.value) {
        return;
    }
    if (e === 'disable') {
        enableDisablePromise.value = skapi.disableService(currentService.value.service).catch(err => {
            currentService.value.active = 1;
            throw err;
        }).finally(_ => {
            enableDisablePromise.value = false;
        });
        currentService.value.active = 0;
    }
    openDisableService.value = false;
}

watch(() => currentService.value?.subsInfo?.cancel_at_period_end, (newValue) => {
    if (newValue) {
        showPlanCaution.value = true;
    }
    else {
        showPlanCaution.value = false;
    }
}, { immediate: true, deep: true });
watch(modifyServiceName, () => {
    if (modifyServiceName.value) {
        nextTick(() => {
            document.getElementById('modifyServiceName').focus();
        })
    }
})
watch(modifyKey, () => {
    if (modifyKey.value) {
        nextTick(() => {
            document.getElementById('modifyKey').focus();
        })
    }
})
watch(modifyCors, () => {
    if (modifyCors.value) {
        nextTick(() => {
            document.getElementById('modifyCors').focus();
        })
    }
})
</script>

<style lang="less" scoped>
#service {
    max-width: 1200px;
    margin: 0 auto;
}
.infoWrap {
    display: flex;
    flex-wrap: wrap;

    .info {
        position: relative;
        width: 49%;
        padding: 2rem;
        background-color: #fafafa !important;
        border-radius: 8px;
        margin-bottom: 2%;
        margin-right: 2%;
        filter: drop-shadow(0px 2px 4px rgba(0, 0, 0, 0.10));

        &:first-child,
        &:nth-child(2),
        &:nth-child(3) {
            width: 100%;
            margin-right: 0;
        }

        &:nth-child(2) {
            .list {
                h5 {
                    height: 44px;
                    line-height: 44px;
                }
            }
        }

        &:nth-child(5),
        &:nth-child(7) {
            margin-right: 0;
        }

        &.nonClick {
            opacity: 0.5;
            pointer-events: none;
            cursor: default;
        }

        &.hover {
            &.clicked {
                // router-link 스타일 없에기
                text-decoration: unset;
                color: unset;
            }

            &.clicked:active {
                box-shadow: 0 0 0 4px #A5AFFF inset;
            }

            &:hover {
                cursor: pointer;
                background-color: #F5F7FF;
                // filter: drop-shadow(8px 12px 36px rgba(255, 255, 255, 0.30));
            }
        }

        &.card {
            padding-top: 1.4rem;
            border: 0;
        }

        .row {
            height: 44px;
            line-height: 44px;

            h5, h6 {
                display: inline-block;
                vertical-align: middle;
            }
            h5 {
                color: var(--secondary-text);
                font-weight: 400;
                &.blue {
                    color: var(--main-color);
                    font-weight: 700;
                }
            }
            h6 {
                width: 120px;
                color: rgba(0,0,0,0.4);
                font-weight: 400;
            }
        }

        .toggleWrap {
            position: absolute;
            top: 2rem;
            right: 2rem;
            display: inline-block;
            opacity: 1;

            &.locked {
                opacity: 0.4;
            }

            &.active {
                .toggleBg {
                    background-color: var(--main-color);

                    .toggleBtn {
                        transform: translate(31px, -50%);
                        transition: all 0.3s;
                    }
                }
            }

            span {
                color: rgba(0, 0, 0, 0.40);
                font-size: 0.8rem;
                font-weight: 400;
            }

            .toggleBg {
                position: relative;
                display: inline-block;
                vertical-align: middle;
                width: 63px;
                height: 32px;
                margin-left: 1rem;
                border-radius: 16px;
                background-color: rgba(0, 0, 0, 0.6);
                transition: all 0.3s;

                &.nonClickable {
                    .toggleBtn {
                        cursor: default;
                    }
                }
                .toggleBtn {
                    position: absolute;
                    width: 26px;
                    height: 26px;
                    right: unset;
                    left: 3px;
                    top: 50%;
                    transform: translateY(-50%);
                    border-radius: 50%;
                    background-color: #eee;
                    transition: all 0.3s;
                    cursor: pointer;
                }
            }
        }

        .title {
            position: relative;
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: space-between;
            flex-wrap: nowrap;

            .name {
                display: flex;
                flex-wrap: nowrap;
                align-items: center;
                width: calc(100% - 480px);

                h4 {
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
            }

            .right {
                text-align: end;

                > div {
                    text-align: right;
                    display: inline-block;
                    height: 30px;
                }
                .date {
                    span {
                        color: rgba(0, 0, 0, 0.40);
                        font-size: 0.8rem;
                        font-weight: 400;
                        margin-right: 10px;
                    }

                    h6 {
                        display: inline-block;
                        color: rgba(0, 0, 0, 0.60);
                        font-weight: 400;
                    }
                }
            }

            .logoTitle {
                .material-symbols-outlined {
                    margin-right: 17px;
                    vertical-align: middle;
                }
            }

            .modify {
                width: 24px;
                height: 24px;
                margin-left: 8px;
                margin-right: 0;
            }

            .question {
                margin: 0;
                cursor: pointer;

                .material-symbols-outlined {
                    margin: 0;
                }
            }
        }

        .titleWrap {
            .title {
                justify-content: start;
            }

            h4 {
                display: inline-block;
            }
        }

        .question {
            text-decoration: none;
            color: var(--main-color);
            font-size: 0.8rem;
            font-weight: 500;

            &.help {
                position: absolute;
                left: 10rem;
                top: 50%;
                transform: translateY(-50%);
                color: rgba(0, 0, 0, 0.40);
            }

            span {
                margin-left: 5px;
            }
        }

        .listWrap {
            display: flex;
            flex-wrap: wrap;
            justify-content: space-between;

            &.noWrap {
                flex-wrap: nowrap;

                .list {
                    width: 33.333%;
                }
            }

            .list {
                position: relative;
                width: 48%;
                margin-top: 28px;

                h6 {
                    font-weight: 400;
                    color: rgba(0, 0, 0, 0.4);

                    &.active {
                        font-weight: 700;
                        color: rgba(0, 0, 0, 0.6);
                    }
                }

                h5 {
                    position: relative;
                    display: inline-block;
                    vertical-align: middle;
                    font-size: 16px;
                    font-weight: 400;
                    color: rgba(0, 0, 0, 0.6);
                    margin-top: 8px;

                }
                .pen {
                    margin-left: 5px;
                }
                .addBtn {
                    position: absolute;
                    top: 0;
                    right: 0;
                    cursor: pointer;

                    * {
                        font-size: 14px;
                        color: var(--main-color);
                    }
                }
                .keyWrap {
                    height: 128px;
                    border-radius: 8px;
                    border: 1px solid rgba(0, 0, 0, 0.10);
                    margin-top: 12px;
                    overflow-y: auto;
                    padding: 8px 16px;

                    .empty {
                        line-height: 110px;
                        color: rgba(0, 0, 0, 0.4);
                        font-size: 0.8rem;
                        font-weight: 500;
                        text-align: center;
                    }
                    .key {
                        margin-bottom: 12px;
                        &:last-child {
                            margin-bottom: 0;
                        }
                        &.edit {
                            .inputWrap {
                                &.edit {
                                    #keyName {
                                        width: calc(33% - 42px);
                                    }
                                }
                            }
                        }
                    }
                    .material-symbols-outlined {
                        cursor: pointer;
                    }
                    .minus {
                        margin-right: 8px;
                        color: var(--secondary-text);
                    }
                    .inputWrap {
                        display: inline-block;
                        width: calc(100% - 62px);
                    }
                    .buttonWrap {
                        display: inline-block;
                        width: 62px;
                        text-align: right;
                        vertical-align: middle;
                        .save {
                            margin: 0 5px 0 9px;
                            color: var(--main-color);
                        }
                        .edit {
                            color: var(--secondary-text);

                            &.none {
                                display: none;
                            }
                        }
                    }
                    input {
                        border: 0;
                        border-bottom: 1px solid rgba(0, 0, 0, 0.80);
                        background-color: unset;
                        color: var(--secondary-text);
                    }
                    #keyName {
                        display: inline-block;
                        vertical-align: middle;
                        width: 30%;
                        height: 20px;
                        margin-right: 4%;
                        font-size: 14px;
                        color: var(--secondary-text);
                    }
                    #secretKey {
                        display: inline-block;
                        vertical-align: middle;
                        width: 66%;
                        height: 20px;
                        font-size: 14px;
                        color: var(--secondary-text);
                        white-space: nowrap;
                        overflow: hidden;
                        text-overflow: ellipsis;
                    }
                }
            }
        }

        .que {
            position: absolute;
            top: 46px;
            right: 44px;
            display: flex;
            flex-wrap: nowrap;
            align-items: center;
            color: rgba(0, 0, 0, 0.6);
            cursor: help;

            span {
                margin-left: 8px;
                font-size: 16px;
                font-weight: 500;
            }
        }
    }
}

.codeWrap {
    position: relative;
    border-radius: 8px;
    border: 1px solid rgba(255, 255, 255, 0.10);
    background: rgba(0,0,0,0.8);
    font-family: monospace;
    color: #FFF;
    box-shadow: 3px 9px 6px 0px rgba(0, 0, 0, 0.15);
    margin-top: 1.5rem;
    user-select: text !important;
    margin-bottom: 1rem;

    .codeInner {
        width: 100%;
        white-space: pre;
        overflow-x: auto;
        padding: 1rem;
        line-height: 1.4;
        font-size: 0.9rem;
    }
    .copy {
        position: absolute;
        right: 20px;
        top: 28px;
        transform: translateY(-50%);
        color: #fff;

        &::after {
            position: absolute;
            display: block;
            right: 30px;
            top: 50%;
            transform: translateY(-50%);
            text-align: center;
            font-size: 14px;
            font-weight: 400;
            background: rgba(255, 255, 255, 0.6);
            color: #343434;
            padding: 4px;
            content: "Copied";
            transition: opacity .4s;
            opacity: 0;
        }

        &.copied::after {
            opacity: 1;
        }
    }
}

.desc {
    li {
        color: var(--secondary-text);
        line-height: 1.4rem;
        margin-left: 1rem;

        &::marker {
            color: var(--primary-text);
        }
        span {
            color: var(--primary-text);
            font-weight: 700;
        }
    }
}

@media (max-width: 1023px) {
    .infoWrap {
        .info {
            width: 100%;
            margin-right: 0;
        }
    }
}

@media (max-width:767px) {
    .infoWrap {
        .info {
            .toggleWrap {
                position: relative;
                top: unset;
                right: unset;

                .toggleBg {
                    margin-left: 2rem;
                }
            }
            &:nth-child(3) {
                .listWrap {
                    .list {
                        &:nth-child(3) {
                            margin-bottom: 28px;
                        }
                    }
                }
            }
            >.title {
                display: block;

                .name {
                    width: 100%;
                    margin-bottom: 0.8rem;
                }

                .right {
                    > div {
                        text-align: left;
                    }
                }
            }
            .listWrap {
                display: block;
                .list {
                    width: unset !important;
                    text-align: left !important;
                    .customInput {
                        max-width: unset;
                    }
                    .addBtn {
                        position: relative;
                        text-align: right;
                    }
                }
            }
        }
    }
}
</style>