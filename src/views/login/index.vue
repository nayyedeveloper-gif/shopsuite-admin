<template>
  <div class="login-page">
    <header class="login-header">
      <div class="brand">
        <span class="brand-mark" />
        <span class="brand-name">{{ title }}</span>
      </div>
    </header>

    <main class="login-main">
      <section class="login-hero">
        <h1 class="hero-title">{{ t('欢迎来到') }} {{ title }}</h1>
        <p class="hero-desc">
          Manage products, orders, and merchants in one place.
        </p>
        <div aria-hidden="true" class="hero-visual">
          <div class="ring ring-1" />
          <div class="ring ring-2" />
          <div class="glass glass-a" />
          <div class="glass glass-b" />
          <div class="glass glass-c" />
        </div>
      </section>

      <section class="login-panel">
        <el-form
          ref="formRef"
          class="login-form"
          label-position="top"
          :model="form"
          :rules="rules"
          @submit.prevent
        >
          <h2 class="form-title">{{ t('欢迎来到') }} {{ title }}!</h2>

          <el-form-item prop="username">
            <el-input
              v-model.trim="form.username"
              v-focus
              :placeholder="t('请输入用户名')"
              size="large"
              tabindex="1"
              type="text"
            />
          </el-form-item>

          <el-form-item prop="password">
            <el-input
              :key="passwordType"
              ref="passwordRef"
              v-model.trim="form.password"
              :placeholder="t('请输入密码')"
              size="large"
              tabindex="2"
              :type="passwordType"
              @keyup.enter="handleLogin"
            >
              <template v-if="passwordType === 'password'" #suffix>
                <ms-icon
                  class="show-password"
                  icon="eye-off-line"
                  @click="handlePassword"
                />
              </template>
              <template v-else #suffix>
                <ms-icon
                  class="show-password"
                  icon="eye-line"
                  @click="handlePassword"
                />
              </template>
            </el-input>
          </el-form-item>

          <el-form-item class="captcha-item" prop="verify_code">
            <el-input
              v-model.trim="form.verify_code"
              :placeholder="t('验证码')"
              size="large"
              tabindex="3"
              type="text"
              @keyup.enter="handleLogin"
            />
            <el-image class="code" :src="captchaUrl" @click="changeCode" />
          </el-form-item>

          <el-form-item class="submit-item">
            <el-button
              class="login-btn"
              :loading="loading"
              size="large"
              type="primary"
              @click="handleLogin"
            >
              {{ t('登录') }}
            </el-button>
          </el-form-item>
        </el-form>
      </section>
    </main>
  </div>
</template>

<script>
  import { useSettingsStore } from '@/store/modules/settings'
  import { useUserStore } from '@/store/modules/user'
  import { translate as t } from '@/i18n'
  import { onBeforeRouteLeave } from 'vue-router'
  import { URL, httpCode } from '@/config'
  import { uuid } from '@/utils'

  export default defineComponent({
    name: 'Login',
    directives: {
      focus: {
        mounted(el) {
          el.querySelector('input').focus()
        },
      },
    },
    setup() {
      const route = useRoute()
      const router = useRouter()

      const userStore = useUserStore()
      const settingsStore = useSettingsStore()

      const login = (form) => userStore.login(form)

      const validateUsername = (rule, value, callback) => {
        if ('' === value) callback(new Error(t('用户名不能为空')))
        else callback()
      }
      const validatePassword = (rule, value, callback) => {
        callback()
      }

      const state = reactive({
        formRef: null,
        passwordRef: null,
        form: {
          username: '',
          password: '',
          verify_code: '',
          verify_key: '',
        },
        rules: {
          username: [
            {
              required: true,
              trigger: 'blur',
              validator: validateUsername,
            },
          ],
          password: [
            {
              required: true,
              trigger: 'blur',
              validator: validatePassword,
            },
          ],
          verify_code: [
            {
              required: true,
              trigger: 'blur',
              message: t('验证码'),
            },
          ],
        },
        loading: false,
        passwordType: 'password',
        redirect: undefined,
        timer: 0,
        captchaUrl: '',
        previewText: '',
      })

      state.form.verify_key = uuid()
      state.captchaUrl = `${URL.verifyCode}?verify_key=${state.form.verify_key}&timestamp=${new Date().getTime()}`

      const handleRoute = () => {
        return state.redirect === '/404' || state.redirect === '/403'
          ? '/'
          : state.redirect
      }
      const handlePassword = () => {
        state.passwordType === 'password'
          ? (state.passwordType = '')
          : (state.passwordType = 'password')
        nextTick(() => {
          state['passwordRef'].focus()
        })
      }
      const handleLogin = async () => {
        state['formRef'].validate(async (valid) => {
          if (valid)
            try {
              state.loading = true
              await login(state.form).catch(({ code }) => {
                if (httpCode.CodeBusinessValidationFailed == code) {
                  changeCode()
                }
              })

              await router.push(handleRoute())
            } finally {
              state.loading = false
            }
        })
      }
      const changeCode = () => {
        state.form.verify_key = uuid()
        state.captchaUrl = `${URL.verifyCode}?verify_key=${state.form.verify_key}&timestamp=${new Date().getTime()}`
        state.form.verify_code = ''
      }

      onBeforeMount(() => {
        // no demo autofill
      })

      watchEffect(() => {
        state.redirect = (route.query && route.query.redirect) || '/'
      })

      onBeforeRouteLeave((to, from, next) => {
        clearInterval(state.timer)
        next()
      })

      return {
        t,
        ...toRefs(state),
        title: settingsStore.getTitle,
        handlePassword,
        handleLogin,
        changeCode,
      }
    },
  })
</script>

<style lang="scss" scoped>
  .login-page {
    position: relative;
    min-height: 100vh;
    overflow: hidden;
    background:
      radial-gradient(ellipse 80% 60% at 20% 40%, rgba(47, 105, 255, 0.12), transparent 55%),
      radial-gradient(ellipse 70% 50% at 85% 20%, rgba(140, 120, 255, 0.1), transparent 50%),
      linear-gradient(180deg, #f5f8ff 0%, #eef3fb 45%, #f7f9fc 100%);
  }

  .login-header {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 2;
    display: flex;
    align-items: center;
    height: 64px;
    padding: 0 40px;
  }

  .brand {
    display: flex;
    gap: 10px;
    align-items: center;
  }

  .brand-mark {
    width: 28px;
    height: 28px;
    background: linear-gradient(135deg, #2f69ff 0%, #6b8cff 100%);
    border-radius: 8px;
    box-shadow: 0 6px 16px rgba(47, 105, 255, 0.28);
  }

  .brand-name {
    font-size: 18px;
    font-weight: 600;
    color: #1f2329;
    letter-spacing: 0.2px;
  }

  .login-main {
    display: flex;
    gap: 48px;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    padding: 80px 48px 48px;
  }

  .login-hero {
    flex: 1 1 480px;
    max-width: 560px;
  }

  .hero-title {
    margin: 0 0 12px;
    font-size: 36px;
    font-weight: 700;
    line-height: 1.25;
    color: #1f2329;
  }

  .hero-desc {
    max-width: 420px;
    margin: 0 0 36px;
    font-size: 15px;
    line-height: 1.6;
    color: #646a73;
  }

  .hero-visual {
    position: relative;
    width: min(100%, 420px);
    height: 280px;
    margin-top: 8px;
  }

  .ring {
    position: absolute;
    top: 50%;
    left: 50%;
    border: 1px solid rgba(47, 105, 255, 0.18);
    border-radius: 50%;
    transform: translate(-50%, -50%);
  }

  .ring-1 {
    width: 220px;
    height: 220px;
    background: radial-gradient(circle, rgba(47, 105, 255, 0.08), transparent 70%);
  }

  .ring-2 {
    width: 300px;
    height: 300px;
    border-color: rgba(47, 105, 255, 0.1);
  }

  .glass {
    position: absolute;
    border: 1px solid rgba(255, 255, 255, 0.55);
    border-radius: 16px;
    box-shadow: 0 20px 40px rgba(47, 105, 255, 0.12);
    backdrop-filter: blur(8px);
  }

  .glass-a {
    top: 58px;
    left: 90px;
    width: 150px;
    height: 150px;
    background: linear-gradient(145deg, rgba(47, 105, 255, 0.55), rgba(140, 120, 255, 0.25));
    transform: rotate(-18deg);
  }

  .glass-b {
    top: 96px;
    left: 180px;
    width: 120px;
    height: 120px;
    background: linear-gradient(145deg, rgba(107, 140, 255, 0.45), rgba(180, 170, 255, 0.2));
    transform: rotate(12deg);
  }

  .glass-c {
    top: 40px;
    left: 210px;
    width: 90px;
    height: 90px;
    background: linear-gradient(145deg, rgba(255, 255, 255, 0.55), rgba(47, 105, 255, 0.2));
    transform: rotate(28deg);
  }

  .login-panel {
    flex: 0 0 420px;
    width: 420px;
  }

  .login-form {
    padding: 40px 36px 36px;
    background: #ffffff;
    border-radius: 16px;
    box-shadow: 0 12px 40px rgba(31, 35, 41, 0.08);
  }

  .form-title {
    margin: 0 0 28px;
    font-size: 24px;
    font-weight: 700;
    line-height: 1.35;
    color: #1f2329;
  }

  .login-btn {
    width: 100%;
    height: 44px;
    margin-top: 4px;
    font-size: 16px;
    font-weight: 600;
    background: #2f69ff !important;
    border: 0 !important;
    border-radius: 10px;

    &:hover,
    &:focus {
      background: #2558e6 !important;
    }
  }

  .show-password {
    font-size: 16px;
    color: #8f959e;
    cursor: pointer;
  }

  .captcha-item {
    :deep(.el-form-item__content) {
      position: relative;
    }
  }

  .code {
    position: absolute;
    top: 50%;
    right: 8px;
    z-index: 2;
    height: 36px;
    cursor: pointer;
    border-radius: 6px;
    transform: translateY(-50%);
  }

  :deep() {
    .el-form-item {
      margin-bottom: 18px;
    }

    .submit-item {
      margin-bottom: 0;
      margin-top: 8px;
    }

    .captcha-item .el-input__wrapper {
      padding-right: 110px;
    }

    .el-input__wrapper {
      padding: 4px 14px;
      background: #f2f3f5;
      border-radius: 10px;
      box-shadow: none !important;
      transition: background 0.2s ease, box-shadow 0.2s ease;

      &:hover {
        background: #ebedf0;
      }

      &.is-focus {
        background: #fff;
        box-shadow: 0 0 0 1px #2f69ff inset !important;
      }
    }

    .el-input__inner {
      height: 40px;
      font-size: 14px;
      color: #1f2329;
    }

    .el-form-item__error {
      padding-top: 4px;
      padding-left: 2px;
    }
  }

  @media (max-width: 960px) {
    .login-main {
      flex-direction: column;
      padding: 96px 20px 40px;
    }

    .login-hero {
      display: none;
    }

    .login-panel,
    .login-form {
      width: 100%;
      max-width: 420px;
    }

    .login-header {
      padding: 0 20px;
    }
  }
</style>
