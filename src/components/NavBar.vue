<template lang="pug">
header#navBar(style='--position: relative;')
    nav#top
        .left
            router-link.logo(to="/")
                template(v-if="route.name == 'home'")
                    img.full(src="@/assets/img/logo/logo-white.svg")
                    img.symbol(src="@/assets/img/logo/symbol-logo-white.png" style="image-orientation: none;")
                template(v-else-if="route.name == 'dashboard' || route.name == 'accountSettings'")
                    img.full(src="@/assets/img/logo/logo.png")
                    img.symbol(src="@/assets/img/logo/symbol-logo.png" style="image-orientation: none;")
                //- img(v-else-if="route.name == 'dashboard' || route.name == 'accountSettings'" src="@/assets/img/logo/logo.png")
                img.small(v-else src="@/assets/img/logo/symbol-logo.png")
        .right(:class="{'flex' : route.params.service && currentService}")
            .topRoute(v-if="route.params.service && currentService" ref="topRoute") 
                router-link.service(:to="`/dashboard/${currentService.service}`") 
                    h5 {{ currentService.name }}
            .topMenu(:class="{'white' : route.name == 'home'}")
                template(v-if="account")
                    ul
                        li
                            a(href="https://twitter.com/skapijs" target="_blank")
                                img(src="@/assets/img/icon/twitter.svg")
                        li
                            a(href="https://discord.gg/SnNjFPYZMa" target="_blank")
                                img(src="@/assets/img/icon/discord.svg")
                    ul
                        li.doc
                            a(href="https://docs.skapi.com" target="_blank") Documentation
                        li.dash
                            router-link(to="/dashboard") My Services
                        li.account(@click.stop="accountInfo = !accountInfo") {{ account.email.charAt(0).toUpperCase() }}
                template(v-else)
                    ul
                        li
                            a(href="https://twitter.com/skapijs" target="_blank")
                                img(src="@/assets/img/icon/twitter.svg")
                        li
                            a(href="https://discord.gg/SnNjFPYZMa" target="_blank")
                                img(src="@/assets/img/icon/discord.svg")
                    ul
                        li.doc 
                            a(href="https://docs.skapi.com" target="_blank") Documentation
                        li.login
                            router-link(to="/login") Login
                        li 
                            router-link.signup(to="/signup") Sign-up
        .prof(v-if="accountInfo && account" @click.stop)
            .member 
                //- img(v-if="account.approved.includes('ggl')" src="@/assets/img/icon/google.svg" style="display:inline-block;width:20px;height:20px;vertical-align:middle;margin-right:10px;")
                span {{ account.email }}
            .settings 
                .setting(@click="navigateToPage")
                    span.material-symbols-outlined.sml settings
                    span Account Settings
                .setting(@click="logout")
                    span.material-symbols-outlined.sml logout
                    span Logout
            a.policy
                router-link(to="/privacy" target="_blank") terms of service ● privacy policy
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router';
import { skapi, account, bodyClick } from '@/main';
import { services, currentService, storageInfo, serviceUsers } from '@/data';
import { serviceRecords } from '@/views/Service/Records/RecordFetch';

let route = useRoute();
let router = useRouter();
let topRoute = ref(null);
let accountInfo = ref(false);

bodyClick.nav = ()=>{
    accountInfo.value = false;
}

let navigateToPage = () => {
    accountInfo.value = false;
    router.push({ path: '/accountSettings' });
}

let logout = async () => {
    accountInfo.value = false;
    account.value = null;
    services.value = [];
    storageInfo.value = {};

    for (let k in serviceUsers) {
        delete serviceUsers[k];
    }

    for (let k in serviceRecords) {
        delete serviceRecords[k];
    }

    await skapi.logout();

    router.push({ path: '/' });
}

let resize = () => {
    if(topRoute.value) {
        if (window.innerWidth < 1024) {
            topRoute.value.classList.add('service');
        } else {
            topRoute.value.classList.remove('service');
        }
    }
}

onMounted(() => {
    window.addEventListener('resize', resize);
})
onBeforeUnmount(() => {
    window.removeEventListener('resize', resize);
})
</script>

<style lang="less" scoped>
#top {
    position: var(--position);
    left: 0;
    top: 0;
    width: 100%;
    height: 60px;
    z-index: 999;
    padding: 10px 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    background-color: var(--background-color);
    transition: all 0.3s;
    .left {
        position: relative;
        width: 236px;
        .logo {
            display: block;
            height: 32px;

            img {
                height: 100%;
                
                &.symbol {
                    height: 85%;
                    display: none;
                }
                &.small {
                    height: 85%;
                    vertical-align: middle;
                }
            }
        }
    }
    .right {
        width: calc(100% - 220px);
        text-align: right;
        
        &.flex {
            display: flex;
            flex-wrap: nowrap;
            align-items: center;
            justify-content: space-between;
        }
        .topRoute {
            ol {
                height: 40px;
                display: flex;
                align-items: center;
    
                li {
                    position: relative;
                    list-style: none;
                    margin-right: 50px;
    
                    a {
                        font-size: 1rem;
                        font-weight: 700;
                        text-decoration: none;
                        color: rgba(0, 0, 0, 0.40);
                    }
    
                    h5 {
                        // max-width: 80px;
                        // white-space: nowrap;
                        // overflow: hidden;
                        // text-overflow: ellipsis;
                    }
    
                    &:last-child {
                        margin-right: 0;
                    }
    
                    &::before {
                        position: absolute;
                        content: '>';
                        right: -30px;
                        top: 50%;
                        transform: translateY(-50%);
                        font-size: 20px;
                        color: rgba(0, 0, 0, 0.40);
                    }
    
                    &.active {
                        a {
                            color: #293FE6;
                        }
                    }
    
                    &.active::before {
                        display: none;
                    }
                }
            }
            .service {
                // display: none;
                text-decoration: none;
                color: #293FE6;
            }
        }

        .topMenu {
            display: flex;
            align-items: center;
            justify-content: end;

            &.white {
                ul {
                    &:first-child {
                        &::after {
                            background-color: rgba(255,255,255,0.4);
                        }
                    }
                    li {
                        a {
                            color: #fff;

                            &:hover {
                                color: #9BBDFF;

                                img {
                                    filter: brightness(0) saturate(100%) invert(75%) sepia(81%) saturate(1540%) hue-rotate(186deg) brightness(101%) contrast(102%);
                                }
                            }
                            img {
                                filter: invert(100%) sepia(0%) saturate(7500%) hue-rotate(355deg) brightness(107%) contrast(106%);
                                opacity: 1;
                            }
                        }
                    }
                }
            }

            ul {
                position: relative;
                display: flex;
                align-items: center;
                line-height: 40px;
                padding: 0 1rem;
    
                &:first-child {
                    &::after {
                        position: absolute;
                        content: '';
                        top: 50%;
                        right: 0;
                        transform: translateY(-50%);                    
                        width: 1px;
                        height: 25px;
                        background-color: rgba(0,0,0,0.1);
                    }
    
                    li {
                        margin-right: 16px;
                    }
                }
    
                &:last-child {
                    padding-right: 0 !important;
                }
    
                li {
                    list-style: none;
                    margin-right: 1rem;
                    text-align: center;
    
                    &:last-child {
                        margin-right: 0;
                    }
                    
                    a {
                        color: rgba(0,0,0,0.6);
                        text-decoration: none;
                        font-size: 1rem;
                        font-weight: 700;
                        cursor: pointer;
                        
                        &:hover {
                            color: rgba(0,0,0,1);
    
                            img {
                                opacity: 1;
                            }
    
                            &.signup {
                                color: #fff;
                            }
                        }
    
                        &.signup {
                            color: #fff;
                            padding: 8px 20px;
                            border-radius: 8px;
                            font-size: 0.8rem;
                            font-weight: 700;
                            background: #293FE6;
                        }
    
                        img {
                            width: 20px;
                            height: 20px;
                            opacity: 0.6;
                            vertical-align: middle;
                            margin-bottom: 5px;
                        }
                    }
    
                    &:last-child {
                        margin-right: 0;
                    }
    
                    &.account {
                        position: relative;
                        margin-right: 0;
                        width: 2rem;
                        height: 2rem;
                        border-radius: 50%;
                        background-color: #293FE6;
                        color: #fff;
                        font-size: 1rem;
                        // display: flex;
                        // align-items: center;
                        // justify-content: center;
                        cursor: pointer;
                    }
                }
            }
        }

    }
    .prof {
        position: absolute;
        right: 40px;
        top: 70px;
        min-width: 265px;
        overflow: hidden;
        background-color: #fafafa;
        color: rgba(0, 0, 0, 0.80);
        border: 1px solid rgba(0, 0, 0, 0.15);
        box-shadow: 8px 12px 36px rgba(0, 0, 0, 0.10);

        border-radius: 8px;
        z-index: 99;

        .member {
            padding: 20px;
            border-bottom: 1px solid rgba(0, 0, 0, 0.15);

            h4 {
                font-size: 0.8rem;
                font-weight: 700;
            }

            span {
                font-size: 0.7rem;
            }
        }

        .settings {
            padding: 20px;
            border-bottom: 1px solid rgba(0, 0, 0, 0.15);

            .setting {
                display: flex;
                align-items: center;
                margin-bottom: 18px;
                cursor: pointer;
                font-size: 0.8rem;
                font-weight: 500;
                color: #293FE6;

                &:last-child {
                    margin-bottom: 0;
                }

                span {
                    &:first-child {
                        fill: #293FE6;
                        margin-right: 10px;
                    }
                }
            }
        }

        .policy {
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 0.6rem;
            font-weight: 500;
            padding: 10px 0;
            
            a {
                text-decoration: none;
                color: rgba(0, 0, 0, 0.6);
            }
        }
    }
}

// @media (max-width:1023px) {
@media (max-width:1110px) {
    #top {
        .left {
            width: 65px;
        }
        .right {
            width: calc(100% - 65px);
            // .topRoute {
            //     ol {
            //         display: none;
            //     }
            //     .service {
            //         display: block;
            //     }
            // }
        }
    }
}

@media (max-width:767px) {
    #top {
        .right {
            .topMenu {
                ul {
                    li {
                        &.doc, &.account {
                            display: none;
                        }
                        &.dash {
                            margin-right: 0;
                        }
                    }
                }
            }
        }
    }
}

@media (max-width:479px) {
    #top {
        .left {
            .logo {
                img {
                    &.full {
                        display: none;
                    }
                    &.symbol {
                        display: block;
                    }
                }
            }
        }
    }
}
</style>