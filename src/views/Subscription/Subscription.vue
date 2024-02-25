<template lang="pug">
.subsWrap(v-if='currentService')
    //- .back(@click="router.push('/myServices/' + currentService.service)")
    .back(@click="router.go(-1)")
        span.material-symbols-outlined.mid.clickable arrow_back_ios
        span Back
    main#subscription
        .inner
            img(src="@/assets/img/logo/logo.png" style="width:193px;")
            
            br
            br
            br
            br
            br

            section.serviceInfo 
                .row
                    h5 Service Name
                    span {{ currentService.name }}

                .row 
                    h5 Service ID
                    span {{ currentService.service }}

                .row 
                    h5 Service Plan
                    template(v-if="currentService.group == 1") 
                        span Trial
                    template(v-else-if="currentService.group == 2 || currentService.group == 51") 
                        span Standard
                    template(v-else-if="currentService.group == 3") 
                        span Premium
                    template(v-else-if="currentService.group == 50") 
                        span Unlimited
                    template(v-else="currentService.group == 51") 
                        span Free Standard

            br
            br

            table
                tbody
                    tr.title
                        td(colspan="4") 
                            h4 Service Plan
                    tr
                        td(rowspan="2") 
                        td(:class="{'currentMode' : currentService.group == 1}" style="padding-top: 1.8rem;")
                            .mode
                                p Trial Mode
                                span.fee $0
                                p(style="font-size:0.8rem;") Billed monthly

                        td(:class="{'currentMode' : currentService.group == 2 || currentService.group == 51}" style="padding-top: 1.8rem;") 
                            .mode
                                p Standard Mode
                                span.fee $19
                                p(style="font-size:0.8rem") Billed monthly
                        td(:class="{'currentMode' : currentService.group == 3}" style="padding-top: 1.8rem;")
                            .mode
                                p Premium Mode
                                span.fee $129
                                p(style="font-size:0.8rem") Billed monthly
                    tr
                        td(:class="{'currentMode' : currentService.group == 1}")
                            button.disabled(v-if="currentService.group == 1") Current Plan
                        td(:class="{'currentMode' : currentService.group == 2 || currentService.group == 51}")
                            button.final(v-if="currentService.group == 3" @click="showDowngradePlan = true;changeMode = 'standard'") Downgrade
                            button.final(v-if="currentService.group == 1" @click="showUpgradePlan = true;changeMode = 'standard'") Upgrade
                            button.disabled(v-else-if="currentService.group == 2 || currentService.group == 51") Current Plan
                        td(:class="{'currentMode' : currentService.group == 3}")
                            button.final(v-if="currentService.group == 1 || currentService.group == 2 || currentService.group == 51" @click="showUpgradePlan = true;changeMode = 'premium'") Upgrade
                            button.disabled(v-else-if="currentService.group == 3") Current Plan
                    tr.title
                        td(style="padding-top:1.9rem")
                            h4 Compare Features
                        td(:class="{'currentMode' : currentService.group == 1}")
                        td(:class="{'currentMode' : currentService.group == 2 || currentService.group == 51}")
                        td(:class="{'currentMode' : currentService.group == 3}")
                    tr.feature
                        td #of User Account
                        td(:class="{'currentMode' : currentService.group == 1}") 10 k
                        td(:class="{'currentMode' : currentService.group == 2 || currentService.group == 51}") 10 k
                        td(:class="{'currentMode' : currentService.group == 3}") 100 k
                    tr.feature
                        td Database
                        td(:class="{'currentMode' : currentService.group == 1}") 4 G
                        td(:class="{'currentMode' : currentService.group == 2 || currentService.group == 51}") 4 G
                        td(:class="{'currentMode' : currentService.group == 3}") 100 G
                    tr.feature
                        td.feature File Storage
                        td(:class="{'currentMode' : currentService.group == 1}") 50 GB
                        td(:class="{'currentMode' : currentService.group == 2 || currentService.group == 51}") 50 GB
                        td(:class="{'currentMode' : currentService.group == 3}") 1 TB
                    tr.feature
                        td Hosting Storage
                        td(:class="{'currentMode' : currentService.group == 1}") 
                            .material-symbols-outlined.mid.gray cancel
                        td(:class="{'currentMode' : currentService.group == 2 || currentService.group == 51}") 50 GB
                        td(:class="{'currentMode' : currentService.group == 3}") 1 TB
                    tr.feature
                        td Automated Email
                        td(:class="{'currentMode' : currentService.group == 1}") 
                            .material-symbols-outlined.mid.gray cancel
                        td(:class="{'currentMode' : currentService.group == 2 || currentService.group == 51}")
                            .material-symbols-outlined.mid.green check_circle
                        td(:class="{'currentMode' : currentService.group == 3}")
                            .material-symbols-outlined.mid.green check_circle
                    tr.feature
                        td Email Storage
                        td(:class="{'currentMode' : currentService.group == 1}") 
                            .material-symbols-outlined.mid.gray cancel
                        td(:class="{'currentMode' : currentService.group == 2 || currentService.group == 51}") 1 GB
                        td(:class="{'currentMode' : currentService.group == 3}") 10 GB
                    tr.feature
                        td Subdomain Hosting
                        td(:class="{'currentMode' : currentService.group == 1}") 
                            .material-symbols-outlined.mid.gray cancel
                        td(:class="{'currentMode' : currentService.group == 2 || currentService.group == 51}") 
                            .material-symbols-outlined.mid.green check_circle
                        td(:class="{'currentMode' : currentService.group == 3}") 
                            .material-symbols-outlined.mid.green check_circle
                    tr.caution
                        td 
                        td.red(:class="{'currentMode' : currentService.group == 1}")
                            ul 
                                li All the users and data will be deleted every 7 days
                        td(:class="{'currentMode' : currentService.group == 2 || currentService.group == 51}") 
                        td.blue(:class="{'currentMode' : currentService.group == 3}")
                            ul 
                                li Unlimited use with pay-as-you-go when exceeding the limit

            br
            br

            template(v-if="getSubs")
                section(v-if="getSubs?.cancel_at_period_end")
                    h4 Resume Plan

                    br

                    ul.desc 
                        li Your current service plan has been canceled and deactivated. To reactivate the service, please resume the plan. 
                            em(style="color:var(--caution-color);font-style: normal;") Your service will be completely deleted on 0000-00-00.
                    
                    br

                    .btn(style="display:block;text-align:right;")
                        button.final(@click="checkDate") Resume Plan

                section(v-else)
                    h4 Cancel Plan

                    br

                    ul.desc
                        li If you cancel the service plan, you will not be billed for the subscription for three months (from the last payment date). The service will be deactivated during the plan cancellation period. 
                            span However, after three months, all data and users will be deleted, and if you do not want this to happen, you must resume the plan before that.

                    br

                    .btn(style="display:block;text-align:right;")
                        button.unFinished.warning(@click="showCancelPlan = true;") Cancel Plan

#proceeding(v-if="serviceFetching")   
    .inner    
        img.loading(src="@/assets/img/loading_white.png")
        br
        br
        h5 Proceeding...

CancelPlanOverlay(v-if="showCancelPlan" @close="closeOverlay")
UpgradePlanOverlay(v-if="showUpgradePlan" @close="closeOverlay" :changeMode="changeMode")
DowngradePlanOverlay(v-if="showDowngradePlan" @close="closeOverlay" :changeMode="changeMode")
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router';
import { nextTick, ref } from 'vue';
import { currentService, serviceFetching } from '@/data.js';
import { skapi, account, customer } from '@/main.js';
import CancelPlanOverlay from '@/views/Subscription/CancelPlanOverlay.vue';
import UpgradePlanOverlay from '@/views/Subscription/UpgradePlanOverlay.vue';
import DowngradePlanOverlay from '@/views/Subscription/DowngradePlanOverlay.vue';

currentService.value = null;

// let x: string | number = 1;

let router = useRouter();
let route = useRoute();
let changeMode = '';
let getSubs = ref(null);
let showCancelPlan = ref(false);
let showUpgradePlan = ref(false);
let showDowngradePlan = ref(false);
let cancelState = ref(false);
let product = JSON.parse(import.meta.env.VITE_PRODUCT);

async function getSubscription() {
    let subs_id = currentService.value.subs_id.split('#');

    console.log(currentService.value)

    if (!currentService.value.subs_id) {
        alert('Service does not have a subscription');
        return;
    }

    if (subs_id.length < 2) {
        alert('Service does not have a subscription');
        return;
    }

    let SUBSCRIPTION_ID = subs_id[0];

    let response = await skapi.clientSecretRequest({
        clientSecretName: 'stripe_test',
        url: `https://api.stripe.com/v1/subscriptions/${SUBSCRIPTION_ID}`,
        method: 'GET',
        headers: {
            Authorization: 'Bearer $CLIENT_SECRET',
            'Content-Type': 'application/x-www-form-urlencoded'
        },
    });

    if (response.error) {
        alert(response.error.message);
        return;
    }

    console.log(response)
    return response;
}

let closeOverlay = async () => {
    showUpgradePlan.value = false;
    showDowngradePlan.value = false;
    showCancelPlan.value = false;

    serviceFetching.value = skapi.getServices(null, true).then(async() => {
        if (currentService.value?.subs_id) {
            getSubs.value = await getSubscription();
        }
        // nextTick(() => {
        //     getCurrentService();
        // })
    }).finally(() => {
        serviceFetching.value = false;
    });
}

let getCurrentService = async () => {
    let srvcId = route.path.split('/')[2];
    currentService.value = skapi.services[srvcId];

    if (!currentService.value) {
        if(account.value) {
            router.replace({ path: '/myServices' });
        } else {
            router.replace({ path: '/login' });
        }
    } else {
        if (currentService.value?.subs_id) {
            getSubs.value = await getSubscription();
        }
    }

    console.log(currentService.value)
}

let checkDate = () => {
    let currentDate =+ new Date();
    let cancelDate = getSubs.value.cancel_at * 1000;
    console.log(currentDate, cancelDate)

    if(currentDate > cancelDate) {
        createPlan();
    } else {
        updatePlan();
    }
}

let createPlan = async (ticket_id) => {
    serviceFetching.value = true;

    if(currentService.group == 2) {
        ticket_id = 'standard'
    } else if(currentService.group == 3) {
        ticket_id = 'premium'
    }

    let resolvedCustomer = await customer;
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
            'subscription_data[metadata][service]': currentService.value.service,
            'subscription_data[metadata][owner]': account.value.user_id,
            'mode': 'subscription',
            'subscription_data[description]': 'Subscription Plan of service ID: ' + currentService.value.service,
            cancel_url: currentUrl.origin + '/subscription/' + currentService.value.service,
            "line_items[0][quantity]": 1,
            'line_items[0][price]': product[ticket_id],
            "success_url": currentUrl.origin + '/subscription/' + currentService.value.service + '?checkout_id={CHECKOUT_SESSION_ID}&service_id=' + currentService.value.service + '&ticket_id=' + ticket_id,
            'tax_id_collection[enabled]': true,
        }
    });
    if (response.error) {
        alert(response.error.message);
        return;
    }

    serviceFetching.value = false;
    window.location = response.url;
}

let updatePlan = async (ticket_id) => {
    serviceFetching.value = true;

    if(currentService.group == 2) {
        ticket_id = 'standard'
    } else if(currentService.group == 3) {
        ticket_id = 'premium'
    }

    let subs_id = currentService.value.subs_id.split('#');

    if (!currentService.value.subs_id) {
        alert('Service does not have a subscription');
        return;
    }

    if (subs_id.length < 2) {
        alert('Service does not have a subscription');
        return;
    }

    let SUBSCRIPTION_ID = subs_id[0];
    let SUBSCRIPTION_ITEM_ID = subs_id[1];

    let response = await skapi.clientSecretRequest({
        clientSecretName: 'stripe_test',
        url: `https://api.stripe.com/v1/subscriptions/${SUBSCRIPTION_ID}`,
        method: 'POST',
        headers: {
            Authorization: 'Bearer $CLIENT_SECRET',
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        data: {
            'items[0][id]': SUBSCRIPTION_ITEM_ID,
            'items[0][price]': product[ticket_id],
            proration_behavior: 'create_prorations',
            'cancel_at_period_end': false
        }
    });

    console.log(response);
    getCurrentService();
    serviceFetching.value = false;

    if (response.error) {
        alert(response.error.message);
        return;
    }
}

if (serviceFetching.value instanceof Promise) {
    serviceFetching.value.then(getCurrentService);
}
else {
    getCurrentService()
}

</script>

<style lang="less">
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

.subsWrap {
    padding: 0 1rem;
    padding-bottom: 5rem;
    margin-top: 72px;
    display: flex;
    flex-wrap: nowrap;
}
.back {
    min-width: 240px;
    margin: 0 16px;

    span {
        display: inline-block;
        vertical-align: middle;
        color: var(--main-color);
        font-weight: 700;
        cursor: pointer;

        &:first-child {
            padding-right: 13px;
        }
    }
}
#subscription {
    width: calc(100vw - 250px);
    min-width: 650px;
    color: var(--primary-text);

    .inner {
        max-width: 1200px;
        margin: 0 auto;
    }

    .row {
        margin-bottom: 0.5rem;

        h5 {
            display: inline-block;
            width: 8rem;
            font-weight: 400;
            color: var(--secondary-text);
        }
        span {
            font-weight: 700;
        }
    }

    table {
        width: 100%;
        border-collapse: collapse;

        tr {
            &.title {
                td {
                    white-space: nowrap;
                    padding-bottom: 1.2rem;
                    border-bottom: 1px solid rgba(0,0,0,0.1);
                    text-align: left;
                }
            }
            &.feature {
                td {
                    // padding: 0.7rem 0;
                    padding-top: 1.8rem;
                    text-align: center;

                    &:first-child {
                        color: var(--secondary-text);
                        text-align-last: left;
                    }
                }
            }
            &.caution {
                td {
                    padding: 1.8rem 1.2rem 3rem 1.2rem;
                    border-bottom: 1px solid rgba(0,0,0,0.1);
                    font-size: 0.8rem;
                    line-height: 1.2rem;
                    text-align: left;
                }
                .red {
                    color: var(--caution-color);
                }
                .blue {
                    color: var(--main-color);
                }
            }
        }
        td {
            width: 25%;
            text-align: center;

            &.currentMode {
                background: rgba(0,0,0,0.05);
            }
            .gray {
                color: rgba(0,0,0,0.4);
            }
            .green {
                color: #52D687;
            }
            .mode {
                display: inline-block;
                text-align: left;
            }
            .fee {
                position: relative;
                display: inline-block;
                font-size: 1.6rem;
                font-weight: 500;
                padding: 1rem 0;

                &::before {
                    position: absolute;
                    content: '/mo';
                    right: -2rem;
                    top: 50%;
                    transform: translateY(-50%);
                    font-size: 0.7rem;
                    font-weight: 500;
                    color: rgba(0,0,0,0.4);
                }
            }
            button {
                margin-top: 1.4rem;
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
}
</style>