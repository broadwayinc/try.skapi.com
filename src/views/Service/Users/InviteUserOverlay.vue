<template lang="pug">
#overlayWindow.dialogBackground(@click="closeDialog" @mousedown="pendClose = true" style='--max-width: 480px;')
    .overlayWrap(@mousedown.stop @mouseup='pendClose = false')
        header
            h5.title Invite User
        main
            .content
                form(@submit.prevent="createUser")
                    p Invitation Email includes a temporary password and the acception link.
                    p User must accept the invitation within 7 days.

                    br

                    p For more information, refer:&nbsp;
                        a(href="https://docs.skapi.com/email/email-templates.html" target="_blank" style='white-space: nowrap') E-Mail Templates

                    br
                    br

                    input(hidden name="service" :value="currentService.service")

                    .input
                        label.label User's Email 
                        input(
                            type="email"
                            @input="e => email = e.target.value"
                            title="Please enter a valid email address." 
                            placeholder="anonymous@anonymous.com"
                            required
                        )
                    br

                    .input
                        label.label Name 
                        input(
                            @input="e => name = e.target.value"
                            placeholder="User's Name" 
                            required
                        )

                    br

                    .input
                        label.label Redirect URL 
                        input(
                            @input="e => redirect = e.target.value"
                            placeholder="URL to redirect when accepted. (optional)"
                            type='url'
                        )

                    .error(v-if="error")
                        .material-symbols-outlined.mid error
                        span {{ error }}

                    br
                    br

                    .buttonWrap
                        template(v-if="promiseRunning")
                            img.loading(src="@/assets/img/loading.png")

                        template(v-else)
                            button.noLine(type="button" @click="emits('close')") Cancel
                            button.final Create User
</template>

<script setup>
import { ref } from 'vue';
import { currentService } from '@/data.js';
import { skapi } from '@/main.js'

let emits = defineEmits(['close']);
let error = ref('');
let promiseRunning = ref(false);
let email = '';
let name = '';
let redirect = '';
let pendClose = false;

let closeDialog = () => {
    if (!promiseRunning.value && pendClose) {
        emits('close', false);
    }
    pendClose = false;
}

let createUser = () => {
    promiseRunning.value = true;
    error.value = '';
    skapi.signup({
        email,
        name,
        access_group: 1,
        service: currentService.value.service
    }, {
        signup_confirmation: redirect || false
    }).then((res) => {
        promiseRunning.value = false;
        emits('close', true);
    }).catch((err) => {
        if (err.code === 'EXISTS') {
            skapi.resendInvitation({
                redirect: redirect || '',
                email,
                service: currentService.value.service
            }).then(() => {
                promiseRunning.value = false;
                emits('close', 'resent');
            }).catch((err) => {
                promiseRunning.value = false;
                error.value = err.message;
            });
        }
        else {
            promiseRunning.value = false;
            error.value = err.message;
        }
    });
}
</script>

<!-- <style lang="less" scoped>
#dialogBackground {
    z-index: 99999;
    position: fixed;
    overflow: hidden;
    left: 0;
    top: 0;
    width: 100vw;
    height: 100vh;
    background-color: rgba(26, 26, 26, 0.25);

    display: table;
    text-align: center;
}

.center {
    display: table-cell;
    vertical-align: middle;
}

.dialog {
    display: inline-block;
    max-height: 100vh;
    overflow: auto;
    text-align: left;

    max-width: 480px; // width of the dialog

    border-radius: 8px;
    border: 1px solid rgba(0, 0, 0, 0.15);
    background: #FAFAFA;
    box-shadow: 0px 2px 4px 0px rgba(0, 0, 0, 0.10);

    .title {
        position: relative;
        color: rgba(0, 0, 0, 0.80);
        padding: 28px;

        &::after {
            position: absolute;
            content: '';
            left: 0;
            bottom: 0;
            width: 100%;
            height: 1px;
            background: rgba(0, 0, 0, 0.10);
            box-shadow: 0px 1px 3px 0px rgba(0, 0, 0, 0.06);
        }
    }

    form {
        padding: 28px;

        p {
            font-size: 0.8rem;
            font-weight: 500;
            line-height: 1.2rem;
        }
        .input {

            .label {
                display: block;
                margin-bottom: 8px;
                color: rgba(0, 0, 0, 0.60);
                font-size: 0.8rem;
                font-weight: 700;
            }

            input {
                background-color: rgba(0, 0, 0, 0.05);
                border-radius: 8px;
                border: 0;
                padding: 12px 15px;
                width: 100%;
                font-size: 0.8rem;
                font-weight: 400;
            }
        }

        .bottom {
            min-height: 44px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            flex-wrap: wrap;

            button {
                height: 44px;
                color: #293FE6;
                background-color: unset;
                font-size: 0.8rem;
                font-weight: 700;
                cursor: pointer;
                
                &.cancel {
                    border: 0;
                }
    
                &.ok {
                    padding: 0 28px;
                    border-radius: 8px;
                    border: 2px solid #293FE6;
                }
            }
        }
    }
}
</style> -->