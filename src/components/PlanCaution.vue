<template lang="pug">
#planCaution 
    .material-symbols-outlined.mid error
    template(v-if="currentService?.subsInfo?.status == 'active' || currentService?.subsInfo?.status == 'canceled'")
        span(v-if="currentService?.subsInfo?.status == 'active'") The service will be deactivated due to the plan cancellation.
        span(v-else-if="currentService?.subsInfo?.status == 'canceled'") The service has been deactivated due to the plan cancellation.
        span(@click="goResume" style="font-weight:700; cursor:pointer; margin:0") Please resume the plan
        span in order to activate your service.
    template(v-else-if="currentService?.subsInfo?.status == 'unpaid'")
        span The payment failed, leading to the cancellation of the subscription.
        span(@click="openCustomerPortal" style="font-weight:700; cursor:pointer; margin:0") Please go to the billing page to fix this.
    .material-symbols-outlined.big.close(@click="emits('close');") close
    //- router-link(to="/accountSettings") Click here to verify
    //- .click(@click="goVerify") Click here to verify
</template>

<script setup>
import { useRouter, useRoute } from 'vue-router';
import { skapi, customer } from '@/main';
import { currentService } from '@/data.js';
import { ref } from 'vue';

let router = useRouter();
let route = useRoute();
let emits = defineEmits(['close']);
let running = ref(false);

let goResume = () => {
    let srvcId = route.path.split('/')[2];
    router.push("/subscription/" + srvcId)
}

let openCustomerPortal = async () => {
    running.value = true;

    let resolvedCustomer = await customer;

    skapi.clientSecretRequest({
        clientSecretName: 'stripe_test',
        url: `https://api.stripe.com/v1/billing_portal/sessions`,
        method: 'POST',
        headers: {
            Authorization: 'Bearer $CLIENT_SECRET',
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        data: {
            customer: resolvedCustomer.id,
            return_url: window.location.origin + '/experiment'
        }
    }).then(response => {
        window.location = response.url;
        running.value = false;
    });
}
</script>

<style lang="less" scoped>
#planCaution {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    padding: 0.8rem;
    background: #FFE7E8;
    font-size: 0.8rem;
    text-align: center;
    z-index: 99999;

    > * {
        display: inline-block;
        color: rgba(240, 78, 78, 1);
    }
    span {
        margin: 0 7px;
    }
    a, .click {
        text-decoration: none;
        font-weight: 700;
        cursor: pointer;
    }
    .close {
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        right: 2rem;
        color: var(--secondary-text);
        cursor: pointer;
    }
}

@media (max-width: 1280px) {
    #planCaution {
        width: 100%;
    }
}
</style>