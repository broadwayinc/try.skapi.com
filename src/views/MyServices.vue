<template lang="pug">
main#myServices
    .createButton(@click="createService" :class="{'nonClickable' : !account?.email_verified}")
        .material-symbols-outlined.mid add
        span Create new service
    
    .tableWrap
        table#resizeMe.table
            thead
                tr
                    th.th.center(style="width:150px;")
                    th.th.center(style="width:128px;")
                        | Name of Service
                        .resizer(@mousedown="mousedown")
                    //- th.th.center(style="width:140px;")
                    //-     | Locale
                    //-     .resizer(@mousedown="mousedown")
                    th.th.center(style="width:160px;")
                        | Cors
                        .resizer(@mousedown="mousedown")
                    th.th.center(style="width:168px;")
                        | Date Created
                        .resizer(@mousedown="mousedown")
                    th.th.center(style="width:120px;")
                        | Plan
                        .resizer(@mousedown="mousedown")
                    th.th.center(style="width:120px;")
                        | State
                        .resizer(@mousedown="mousedown")
                    th.th.center(style="width:140px;")
                        | Users
                        .resizer(@mousedown="mousedown")
                    th.th.center(style="width:168px;")
                        | Cloud Storage
                        .resizer(@mousedown="mousedown")
                    th.th(style="width:240px;")
                        | Datebase
                        .resizer(@mousedown="mousedown")
            tbody
                template(v-if="services.length" v-for="(service, index) in services")
                    tr(ref="tr" :class="{'active' : showInfo}" @click="(e) => goServiceDashboard(e, service)")
                        td(style="display:flex;align-items:center;")
                            .material-symbols-outlined.mid.upArrow.hide(ref="upArrow" @click.stop="(e) => showServiceInfo(e, index)") arrow_forward_ios
                            .material-symbols-outlined.mid.downArrow(ref="downArrow" @click.stop="(e) => showServiceInfo(e, index)") arrow_forward_ios
                            .serviceActive(:class="{'active': service.active == 1 }")
                                .material-symbols-outlined.sml.power power_settings_new
                        td
                            .overflow {{ service.service.name }}
                        //- td
                        //-     .overflow {{ regions?.[service.region] || service.region }}
                        td
                            .overflow {{ service.service.cors }}
                        td.center {{ typeof service.service.timestamp === 'string' ? service.service.timestamp : new Date(service.service.timestamp).toDateString() }}
                        td.center
                            template(v-if="service.service.group == 1") Trial
                            template(v-else-if="service.service.group == 2") Standard
                            template(v-else-if="service.service.group == 3") Premium
                            template(v-else-if="service.service.group == 50") Unlimited
                            template(v-else-if="service.service.group == 51") Free Standard
                            template(v-else) ...
                        td.center
                            template(v-if="service?.subscription") 
                                template(v-if="service?.subscription?.cancel_at_period_end") 
                                    .state(style="color:var(--caution-color)") Canceled
                                template(v-else-if="new Date().getTime() < service?.subscription?.canceled_at") 
                                    .state(style="color:#FCA642") Suspended
                                template(v-else style="color:#52D687") 
                                    .state(style="color:#52D687") Running
                            template(v-else)
                                .state(style="color:#52D687") Running
                        td.center
                            template(v-if="service.service.group == 50")
                                .percent.purple Unlimited
                            template(v-else-if="service.service.group !== 50 && Math.ceil(service.service.users/10000*100)")
                                .percent(:class='{"green": 0 <= Math.ceil(service.service.users/10000*100) && Math.ceil(service.service.users/10000*100) < 51, "orange": 51 <= Math.ceil(service.service.users/10000*100) && Math.ceil(service.service.users/10000*100) < 81, "red": 81 <= Math.ceil(service.service.users/10000*100) && Math.ceil(service.service.users/10000*100) < 101}') {{ Math.ceil(service.service.users/10000*100) + '%' }}
                            template(v-else)
                                .percent.green 0%
                        td.center
                            template(v-if="service.group == 50")
                                .percent.purple Unlimited
                            template(v-else-if="service.group !== 50 && Math.ceil(storageInfo?.[service.service]?.cloud/53687091200*100)")
                                .percent(:class='{"green": 0 <= Math.ceil(storageInfo?.[service.service]?.cloud/53687091200*100) && Math.ceil(storageInfo?.[service.service]?.cloud/53687091200*100) < 51, "orange": 51 <= Math.ceil(storageInfo?.[service.service]?.cloud/53687091200*100) && Math.ceil(storageInfo?.[service.service]?.cloud/53687091200*100) < 81, "red": 81 <= Math.ceil(storageInfo?.[service.service]?.cloud/53687091200*100)}') {{ Math.ceil(storageInfo?.[service.service]?.cloud/53687091200*100) + '%' }}
                            template(v-else)
                                .percent.green 0%
                        td(style="padding-left:40px;")
                            template(v-if="service.group == 50")
                                .percent.purple Unlimited
                            template(v-else-if="service.group !== 50 && Math.ceil(storageInfo?.[service.service]?.database/4294967296*100)")
                                .percent(:class='{"green": 0 <= Math.ceil(storageInfo?.[service.service]?.database/4294967296*100) && Math.ceil(storageInfo?.[service.service]?.database/4294967296*100) < 51, "orange": 51 <= Math.ceil(storageInfo?.[service.service]?.database/4294967296*100) && Math.ceil(storageInfo?.[service.service]?.database/4294967296*100) < 81, "red": 81 <= Math.ceil(storageInfo?.[service.service]?.database/4294967296*100)}') {{ Math.ceil(storageInfo?.[service.service]?.database/4294967296*100) + '%' }}
                            template(v-else)
                                .percent.green 0%
                            //- .menu(@click.stop="(e) => showPlanSetting(e, index)" :class='{"nonClickable": !account.email_verified}')
                            //-     .material-symbols-outlined.mid.clickable more_vert
                    tr.cont(ref="trCont" :class="{'active' : showInfo}")
                        td(colspan="9")
                            .info
                                h6 Name
                                span(style="color:var(--primary-text);font-weight:700") {{ service.name }}
                            .info 
                                h6 Service ID 
                                span {{ service.service }}
                            .info 
                                h6 CORS 
                                span {{ service.cors }}
                            br
                            .info.inline
                                h6 # of Users 
                                span {{ service.users }}
                            .info.inline 
                                h6 Database Used
                                span {{ convertToMb(storageInfo?.[service.service]?.database) + '/4000MB' }}
                            .info.inline 
                                h6 Subscription Plan
                                router-link(:to="`/subscription/${service.service}`" style="color:var(--main-color);font-weight:700;")
                                    template(v-if="service.group == 1") Trial
                                    template(v-else-if="service.group == 2") Standard
                                    template(v-else-if="service.group == 3") Premium
                                    template(v-else-if="service.group == 50") Unlimited
                                    template(v-else-if="service.group == 51") Free Standard
                                    template(v-else) ...
                            .info.inline 
                                h6 Hosting Strorage
                                template(v-if="service?.subdomain")
                                    span {{ convertToMb(storageInfo?.[service.service]?.host) + '/50000MB' }}
                                template(v-else)
                                    span -
                            br
                            br
                            .info.inline 
                                h6 Locale
                                span {{ regions?.[service.region] || service.region }}
                            .info.inline 
                                h6 Cloud Storage Used
                                span {{ convertToMb(storageInfo?.[service.service]?.cloud) + '/50000MB' }}
                            .info.inline 
                                h6 Date Created
                                span {{ typeof service.timestamp === 'string' ? service.timestamp : new Date(service.timestamp).toDateString() }}
                            .info.inline 
                                h6 Subdomain
                                template(v-if="service?.subdomain")
                                    span {{ service.subdomain }}
                                template(v-else)
                                    span -
                tr.noServices(v-else)
                    td(colspan="9" style="text-align:center; padding-top:20px;")
                        h3 No Services
                        br
                        p Get started by creating a new service.
    .loadingWrap(v-if="serviceFetching" style="text-align:center; padding-top:20px;")
        img.loading(src="@/assets/img/loading.png")
    br
    .plus(style="display:block;text-align:center;padding-bottom:2rem;")
        .material-symbols-outlined.big(@click="createService" style="color:var(--main-color);cursor:pointer;") add_circle
    
    //- #moreVert.hide(v-if="showMore" @click.stop style="--moreVert-right: 100px;" :style="{top: clientY}")
        .inner
            .more(@click="showMore=false;" style="width:unset;white-space:nowrap;opacity:0.2") Downgrade Plan
            .more(@click="showMore=false;" style="width:unset;white-space:nowrap;opacity:0.2") Upgrade Plan
            .more(@click="showMore=false;" style="width:unset;white-space:nowrap;opacity:0.2") Cancel Plan

#createNewService(:class="{'show' : create}")
    .material-symbols-outlined.mid.close(@click="closeCreateService") close
    form(@submit.prevent="addService")
        header
            h4.title Create New Service
        main(v-if="create")
            .label
                h6 Name of Service
            input#serviceName(type="text" :class="{'warning' : error}" @input='(e)=>{newServiceName=e.target.value;error="";}' placeholder="Name of Service")
            .error(v-if="error")
                .material-symbols-outlined.mid error
                span {{ error }}

            br
            br
        
            .label 
                h6 Service Plan
                span Please choose one of the plans

            br

            .card.clicked(:class="{'checked' : serviceMode == 'trial'}" @click="serviceMode='trial'" style="border-radius:8px;cursor:pointer;")
                .inner
                    .title 
                        h4 Trial Mode
                        .price $0
                    .contWrap(style="justify-content:space-between;")
                        ul
                            li 
                                .material-symbols-outlined.sml.li check_circle
                                span Provides 10k user accounts
                            li 
                                .material-symbols-outlined.sml.li check_circle
                                span 4 GB of database
                            li 
                                .material-symbols-outlined.sml.li check_circle
                                span 50 GB of file storage
                            li 
                                .material-symbols-outlined.sml.li warning
                                span All the users and data will be deleted every 7 days
        
            br

            .card.clicked(:class="{'checked' : serviceMode == 'standard'}" @click="serviceMode='standard'" style="border-radius:8px;cursor:pointer;")
                .inner
                    .title 
                        h4(style="display:inline-block;") Standard Mode
                        .right(style="display:inline-block; text-align:right;")
                            //- .free 
                            //-     span (Only for promotion period)
                            //-     p(style="display:inline-block; margin-left:10px") Free
                            //- .price.discount $19
                            .price $19
                    .contWrap(style="justify-content:space-between;")
                        ul
                            li 
                                .material-symbols-outlined.sml.li check_circle
                                span Provides 10k user accounts
                            li 
                                .material-symbols-outlined.sml.li check_circle
                                span 4GB of database
                            li 
                                .material-symbols-outlined.sml.li check_circle
                                span 50GB each for file storage and hosting storage
                            li 
                                .material-symbols-outlined.sml.li check_circle
                                span Real-time data

                        ul
                            li 
                                .material-symbols-outlined.sml.li check_circle
                                span Automated emails and sending newsletters
                            li 
                                .material-symbols-outlined.sml.li check_circle
                                span 1GB of email storage
                            li 
                                .material-symbols-outlined.sml.li check_circle
                                span Subdomain hosting
        
            br

            .card.clicked(:class="{'checked' : serviceMode == 'premium'}" @click="serviceMode='premium'" style="border-radius:8px;cursor:pointer;")
                .inner
                    .title 
                        h4 Premium Mode
                        .price $129
                    .contWrap(style="justify-content:space-between;")
                        ul
                            li 
                                .material-symbols-outlined.sml.li check_circle
                                span 100k user accounts
                            li 
                                .material-symbols-outlined.sml.li check_circle
                                span 100GB of database
                            li 
                                .material-symbols-outlined.sml.li check_circle
                                span 1TB each for file storage and hosting storage
                            li 
                                .material-symbols-outlined.sml.li check_circle
                                span Real-time data

                        ul
                            li 
                                .material-symbols-outlined.sml.li check_circle
                                span Automated emails and sending newsletters
                            li 
                                .material-symbols-outlined.sml.li check_circle
                                span 10GB of email storage
                            li 
                                .material-symbols-outlined.sml.li check_circle
                                span Subdomain hosting
                            li 
                                .material-symbols-outlined.sml.li check_circle
                                span unlimited use with pay-as-you-go when exceeding the limit

            br
        footer
            .buttonWrap(style="display:flex; justify-content:space-between;")
                //- template(v-if="promiseRunning")
                //-     img.loading(src="@/assets/img/loading.png")
                //- template(v-else)
                button.noLine(@click="closeCreateService") Cancel 
                button.final(type="submit") Create
                    //- button.unFinished(v-else type="submit") Create

#proceeding(v-if="promiseRunning")   
    .inner    
        img.loading(src="@/assets/img/loading_white.png")
        br
        br
        h5 Proceeding...
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { skapi, account, bodyClick, customer } from '@/main.js';
import { services, serviceFetching, storageInfo } from '@/data.js';
import { launch, subdomainInfo } from '@/views/Service/Subdomain/SubdomainFetch.js';

onMounted(() => {
    document.querySelector('body').classList.add('fa');
})
onBeforeUnmount(() => {
    document.querySelector('body').classList.remove('fa');
})

const router = useRouter();
let serviceMode = ref('standard');
let searchFor = ref('service');
let searchText = ref('');
let showInfo = ref(false);
let tr = ref(null);
let downArrow = ref(null);
let upArrow = ref(null);
let trCont = ref(null);
let currentServiceIndex = null;
let currentPlanIndex = null;
let showMore = ref(false);
let clientY = 0;
// let inputError = ref(false);
let error = ref('');

let convertToMb = (size) => {
    if (size) {
        return (size / (1024 * 1024)).toFixed(2) + ' MB'
    }
    else {
        return '-'
    }
}

let showServiceInfo = (e, index) => {
    if(currentServiceIndex == index) {
        downArrow.value[index].classList.remove('hide');
        upArrow.value[index].classList.add('hide');
        trCont.value[index].classList.remove('active');
        currentServiceIndex = null;
        showMore.value = false;

        return;
    } else if(e.target.classList.contains('upArrow')) {
        downArrow.value[index].classList.remove('hide');
        upArrow.value[index].classList.add('hide');
        trCont.value[index].classList.remove('active');
        currentServiceIndex = null;
        showMore.value = false;

        return;
    }

    currentServiceIndex = index;
    downArrow.value[index].classList.add('hide');
    upArrow.value[index].classList.remove('hide');
    trCont.value[index].classList.add('active');
    showMore.value = false;
}

let showPlanSetting = (e, index) => {
    if(currentPlanIndex == index && showMore.value) {
        showMore.value = false;
        currentPlanIndex = null;

        return;
    }

    showMore.value = false;
    currentServiceIndex = index;
    clientY = window.scrollY + e.currentTarget.getBoundingClientRect().top - 120 + 'px';

    showMore.value = true;
    currentPlanIndex = index;
}

let goServiceDashboard = (e, service) => {
    e.currentTarget.classList.add('active');

    setTimeout(() => {
        router.push('/myServices/' + service.service);
    }, 500);
}

bodyClick.recordPage = () => {
    showMore.value = false;
}

// table resize
let prevX, prevW, nextW = 0;
let prevCol, nextCol = null;
let widthSum = 0;

nextTick(() => {
    let ths = document.getElementsByTagName('th');
    let thsArr = Array.from(ths);

    thsArr.forEach((e) => {
        let widthStyle = window.getComputedStyle(e).width;
        e.style.width = widthStyle;
        widthSum += widthStyle;
    });
})

let mouseMoveHandler = function (e) {
    let dx = e.clientX - prevX;
    let ths = document.getElementsByTagName('th');
    let thsArr = Array.from(ths);

    thsArr.forEach((e) => {
        widthSum += e.offsetWidth;
    });

    if ((widthSum < window.innerWidth || dx < 0) && (prevW + dx > 100 && nextW - dx > 100)) {
        prevCol.style.width = `${prevW + dx}px`;
        nextCol.style.width = `${nextW - dx}px`;
    }
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

let getServiceInfo = () => {
    if (services.value) {
        for(let i=0; i<services.value.length; i++) {
            let service = services.value[i].service;
    
            if (!storageInfo.value[service]) {
                storageInfo.value[service] = {};
            }

            skapi.storageInformation(service).then(i => {
                // console.log(i)
                // get storage info
                for (let k in i) {
                    storageInfo.value[service][k] = i[k];
                }
            });

            let sd = services.value[i].subdomain;

            if (sd && (sd[0] !== '*' || sd[0] !== '+')) {
                skapi.listHostDirectory({ dir: sd, info: true }, { limit: 1 }).then(u => {
                    // if (!storageInfo.value[service]) {
                    //     storageInfo.value[service] = {};
                    // }

                    storageInfo.value[service].host = u.size;
                });
            }
        }
    }
}

// update services
if (serviceFetching.value) {
    serviceFetching.value.then(() => {
        // services.value = skapi.serviceMap.map(sid => skapi.services[sid]).reverse();
        getServiceInfo();
    })
}
else {
    // services.value = skapi.serviceMap.map(sid => skapi.services[sid]).reverse();
    getServiceInfo();
}

let create = ref(false);
let createService = () => {
    if (account?.value.email_verified) {
        create.value = true;
        error.value = '';
        document.querySelector('body').classList.add('overflow');
        nextTick(() => {
            document.getElementById('serviceName').focus();
        });
    } else {
        return false;
    }
}
let closeCreateService = () => {
    create.value = false;
    document.querySelector('body').classList.remove('overflow');
}
let newServiceName = '';
let promiseRunning = ref(false);
let addService = () => {
    promiseRunning.value = true;
    if(newServiceName == '') {
        promiseRunning.value = false;
        error.value = 'Please fill in the name of service';

        return;
    }
    services.value.unshift({
        service: '',
        name: newServiceName,
        region: '...',
        created_locale: '...',
        timestamp: '...',
        group: '...',
        cors: '...',
        pending: true,
        active: 0
    });
    skapi.createService({ name: newServiceName })
        .then(s => {
            skapi.insertService(s);
            services.value[0] = s;
            if(serviceMode.value == 'trial') {
                newServiceName = '';
                closeCreateService();
                promiseRunning.value = false;
            } else {
                let service_info = s;
                let ticket_id = serviceMode.value;
                createSubscription(ticket_id, service_info);
            }
        }).catch(err => {
            // alert(err.message);
            console.log(err)
            services.value.shift();
        })
}

let createSubscription = async (ticket_id, service_info) => {
    let resolvedCustomer = await customer;
    let product = JSON.parse(import.meta.env.VITE_PRODUCT);
    let customer_id = resolvedCustomer.id;
    let currentUrl = window.location;

    let response = await skapi.clientSecretRequest({
        clientSecretName: 'stripe_test',
        url: 'https://api.stripe.com/v1/checkout/sessions',
        method: 'POST',
        headers: {
            Authorization: 'Bearer $CLIENT_SECRET',
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        data: {
            client_reference_id: account.value.user_id,
            customer: customer_id,
            'customer_update[name]': 'auto',
            'customer_update[address]': 'auto',
            'subscription_data[metadata][service]': service_info.service,
            'subscription_data[metadata][owner]': account.value.user_id,
            'mode': 'subscription',
            'subscription_data[description]': 'Subscription Plan of service ID: ' + service_info.service,
            cancel_url: currentUrl.origin + '/myServices',
            "line_items[0][quantity]": 1,
            'line_items[0][price]': product[ticket_id],
            "success_url": currentUrl.origin + '/myServices?checkout_id={CHECKOUT_SESSION_ID}&service_id=' + service_info.service + '&ticket_id=' + ticket_id,
            'tax_id_collection[enabled]': true,
        }
    });
    if (response.error) {
        alert(response.error.message);
        return;
    }

    window.location = response.url;
    newServiceName = '';
    closeCreateService();
    promiseRunning.value = false;
};

const regions = {
    'us-west-2': 'US',
    'ap-northeast-2': 'KR',
    'ap-southeast-1': 'SG',
    'ap-south-1': 'IN'
}

skapi.getProfile().then(u => {
    if (u.misc === 'kdu') {
        skapi.consumeTicket({ ticket_id: 'kdu' }).catch(err => console.log({ err })).finally(() => {
            skapi.updateProfile({ misc: '' }).then(up => {
                account.value = up;
            });
        });
    }
}).catch(err => err);
</script>

<style lang="less" scoped>
#myServices {
    position: relative;
    height: calc(100vh - 60px - 3.4rem);
    margin-top: 3.4rem;
    padding: 0 2rem;
}

#createNewService {
    position: fixed;
    right: 0;
    top: 0;
    width: 700px;
    height: 100%;
    background: #FFF;
    box-shadow: -8px 4px 20px 0px rgba(0, 0, 0, 0.10);
    transform: translateX(110%);
    transition: all 0.3s;
    z-index: 999;

    &.show {
        transform: translateX(0px);
    }
    .close {
        position: absolute;
        right: 25px;
        top: 25px;
        font-size: 32px;
        cursor: pointer;
    }
    .card {
        background-color: #fafafa;

        &.checked {
            box-shadow: 0 0 0 4px #A5AFFF inset !important;
            .inner {
                .contWrap {
                    ul {
                        li {
                            .li {
                                color: var(--main-color);
                            }
                        }
                    }
                }
            }
        }
        &.clicked {
            &:hover {
                .inner {
                    .contWrap {
                        ul {
                            li {
                                .li {
                                    color: var(--main-color);
                                }
                            }
                        }
                    }
                }
            }
        }
        .inner {
            .title {
                font-weight: 500;
                color: var(--main-color);

                .free {
                    position: relative;
                    display: inline-block;
                    color: var(--main-color);
                    font-size: 1.2rem;
                    font-weight: 700;

                    span {
                        color: var(--secondary-text);
                        font-size: 0.7rem;
                        font-weight: 400;
                    }
                }

                .price {
                    position: relative;
                    display: inline-block;
                    padding-right: 35px;
                    padding-left: 10px;
                    font-size: 28px;
                    font-weight: 700;

                    &::before {
                        position: absolute;
                        content: '/mo';
                        right: 0;
                        top: 50%;
                        transform: translateY(-50%);
                        font-size: 14px;
                        font-weight: 500;
                        color: rgba(0, 0, 0, 0.40);
                    }
                    &.discount {
                        margin-left: 10px;
                        color: #A7A8AD;

                        &::after {
                            position: absolute;
                            content: '';
                            width: 62%;
                            height: 2px;
                            left: 6px;
                            top: 50%;
                            transform: translateY(-50%);
                            background-color: #A7A8AD;
                        }
                    }
                }
            }
            .contWrap {
                ul {
                    // width: 50%; // <- i don't advise horizontal layout if unnecessary
                    list-style: none;

                    li {
                        .li {
                            font-size: 14px;
                            margin-right: 5px;
                        }
                        span {
                            font-size: 14px;
                            color: rgba(0, 0, 0, 0.60);
                            font-weight: 400;
                        }
                    }
                }
            }
        }
    }
    header {
        height: 100px;
        padding: 2rem;
        border-bottom: 1px solid rgba(0, 0, 0, 0.10);
        box-shadow: 0px 1px 3px 0px rgba(0, 0, 0, 0.06);
        .title {
            color: var(--main-color);
        }
    }
    main {
        height: calc(100vh - 100px);
        padding: 30px 40px 80px;
        overflow: scroll !important;

        h6 {
            display: inline-block;
            color: rgba(0, 0, 0, 0.60);
            margin-bottom: 8px;
        }
        .label {
            span {
                color: rgba(0, 0, 0, 0.40);
                font-size: 14px;
                font-weight: 400;
                margin-left: 16px;
            }
        }
        input {
            width: 100%;
            height: 44px;
            border: 0;
            border-radius: 8px;
            background: rgba(0, 0, 0, 0.05);
            padding: 0 20px;
        }
        .customSelect {
            select {
                height: 44px;
                background: rgba(0, 0, 0, 0.05);
                padding: 0 20px;
            }
        }
    }
    footer {
        position: absolute;
        right: 0;
        bottom: 0;
        width: 100%;
        height: 80px;
        padding: 18px 40px;
        background-color: rgba(255,255,255,0.8);
    }
}

#moreVert {
    .inner {
        .more {
            font-size: 0.8rem;
        }
    }
}

#proceeding {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background-color: rgba(0,0,0,0.25);
    z-index: 9999999;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    text-align: center;

    .loading {
        width: 2rem;
        height: 2rem;
    }
    h5 {
        color: #fff;
    }
}

.createButton {
    display: inline-block;
    // height: 40px;
    padding: 6px 28px 8px;
    border-radius: 8px;
    border: 1px solid #D9D9D9;
    color: var(--main-color);
    cursor: pointer;
    
    * {
        user-select: none;
        font-size: 16px;
        font-weight: 500;
    }
}

.tableWrap {
    position: relative;
    // min-height: calc(100vh - 3.4rem - 160px);
    margin-top: 16px;
    overflow-x: auto;

    .noServices {
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
            position: sticky;
            top: 0px;
            background-color: #fafafa;
            z-index: 10;
            text-align: left;

            tr {
                height: 60px;

                th {
                    position: relative;
                    color: rgba(0, 0, 0, 0.40);
                    font-size: 0.7rem;
                    font-weight: 500;
                    padding-left: 40px;

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
            overflow-y: auto;
            font-weight: 400;

            tr {
                &:not(.cont, .active, .noServices):hover {
                    background-color: rgba(41,63,230,0.05);
                    cursor: pointer;
                }
                &.active {
                    background-color: rgba(41, 63, 230, 0.10);
                }
                &.cont {
                    height: 305px;
                    background-color: rgba(0, 0, 0, 0.02);
                    display: none;

                    &.active {
                        display: table-row;
                    }

                    td {
                        padding: 0 75px;
                    }

                    .info {
                        display: block;
                        margin-bottom: 10px;

                        &.inline {
                            display: inline-block;
                            width: 25%;

                            h6 {
                                display: block;
                                margin-bottom: 8px;
                            }
                        }
                        h6 {
                            display: inline-block;
                            font-weight: 400;
                            color: rgba(0, 0, 0, 0.40);
                            margin-right: 10px;
                        }
                        span {
                            color: rgba(0, 0, 0, 0.60);
                        }
                    }
                }
                &.noServices {
                    td {
                        &::after {
                            display: none !important;
                        }
                    }
                }
            }

            td {
                position: relative;
                height: 60px;
                padding: 0 20px;
                font-size: 0.8rem;

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

                &.center {
                    padding: 0;
                    text-align: center;
                    font-size: 0.8rem;
                }

                .percent {
                    display: inline-block;
                    padding: 3px 12px;
                    border-radius: 4px;
                    box-shadow: 0px -1px 1px 0px rgba(0, 0, 0, 0.15) inset;
                    color: #fff;

                    &.green {
                        background-color: #52D687;
                    }
                    &.orange {
                        background-color: #FCA642;
                    }
                    &.red {
                        background-color: var(--caution-color);
                    }
                    &.purple {
                        background-color: #B881FF;
                    }
                }

                .upArrow, .downArrow {
                    display: inline-block;
                    vertical-align: middle;
                    padding: 10px;
                    border-radius: 50%;
                    font-size: 24px;
                    color: rgba(0,0,0,0.4);
                    cursor: pointer;

                    &:hover {
                        background-color: rgba(41, 63, 230, 0.10);
                    }
                    &.hide {
                        display: none;
                    }
                }

                .upArrow {
                    rotate: 270deg;
                }

                .downArrow {
                    rotate: 90deg;
                }

                .menu {
                    position: absolute;
                    right: 28px;
                    top: 50%;
                    padding: 10px;
                    text-align: center;
                    padding-top: 8px;
                    border-radius: 50%;
                    transform: translateY(-50%);
                    z-index: 1;

                    &:hover {
                        background-color: rgba(41, 63, 230, 0.10);
                    }

                }
                #moreVert {
                    &.hide {
                        display: none;
                    }

                    &.show {
                        display: block;
                    }
                }

                .serviceActive {
                    position: relative;
                    display: inline-block;
                    vertical-align: middle;
                    width: 20px;
                    height: 20px;
                    margin: 0 auto;
                    border-radius: 50%;
                    background-color: rgba(0,0,0,0.25);

                    &.active {
                        background-color: #5AD858;
                    }

                    .power {
                        position: absolute;
                        left: 50%;
                        top: 50%;
                        transform: translate(-50%, -50%);
                        color: #fff;
                    }
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

.plus {
    .material-symbols-outlined {
        position: relative;

        &:hover {
            &::before {
                display: block;
            }
        }

        &::before {
            position: absolute;
            content: '';
            left: 50%;
            top: 50%;
            width: 42px;
            height: 42px;
            transform: translate(-50%, -50%);
            background-color: rgba(41, 63, 230, 0.10);
            border-radius: 50%;
            display: none;
        }
    }
}

@media (max-width: 700px) {
    #createNewService {
            width: 100%;
    } 
}
</style>