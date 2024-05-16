<template>
    <div class="qr-page">
        <el-row type="flex" justify="center" align="middle" style="height: 80vh;">
            <el-col :span="12" class="qr-container">
                <img :src="qrCodeUrl" alt="QR Code" class="qr-code" />
                <div class="alert-container">
                    <el-alert title="温馨提示" type="info" show-icon>
                        <p>请使用手机扫描上方二维码进行更多操作。</p>
                    </el-alert>
                </div>
            </el-col>
        </el-row>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { getQr } from '@/api/login';

const qrCodeUrl = ref('http://panda-1253683406.cos.ap-guangzhou.myqcloud.com/panda/2024/05/13/3dacc3b727ec4db5ab995479c2430dae.png');

onMounted(() => {
    getCode();
});

/**
 * 获取验证码
 */
const getCode = async () => {
    const res = await getQr();
    qrCodeUrl.value = res.msg
};
</script>

<style scoped>
.qr-container {
    text-align: center;
    padding: 20px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    border-radius: 10px;
    display: flex;
    flex-direction: column;
    align-items: center;
    /* Aligns children (img and alert) in the center */
}

.qr-code {
    width: 300px;
    height: 300px;
    margin-bottom: 20px;
}

.alert-container {
    display: flex;
    justify-content: center;
    /* 水平居中 */
    align-items: center;
    /* 垂直居中 (如果需要) */
}
</style>