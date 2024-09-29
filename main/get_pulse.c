#include "main.h"

#define ADDR                                                        0x57
#define PORT                                                        0x00
#define SDA_GPIO                                                    GPIO_NUM_21
#define SCL_GPIO                                                    GPIO_NUM_22
#define I2C_FREQ_HZ                                                 100000

static const char *TAG = "GET_PULSE_TASK";
static portMUX_TYPE mux = portMUX_INITIALIZER_UNLOCKED;

uint32_t polling_num = 0;

void get_pulse_handler(void *parameters)
{
    printf("start of task\n");

    i2c_master_bus_config_t i2c_bus_config = {
        .i2c_port = 0,
        .sda_io_num = SDA_GPIO,
        .scl_io_num = SCL_GPIO,
        .clk_source = I2C_CLK_SRC_DEFAULT,
        .glitch_ignore_cnt = 7,
        .intr_priority = 0,
        .trans_queue_depth = 100,
        .flags.enable_internal_pullup = true,
    };

    i2c_master_bus_handle_t i2c_bus_handle;
    
    esp_err_t res = ( i2c_new_master_bus(&i2c_bus_config, &i2c_bus_handle) ); // create master bus
    printf("bus: %s\n", esp_err_to_name(res));

    i2c_device_config_t i2c_max30102_config = {
        .dev_addr_length = I2C_ADDR_BIT_LEN_7,
        .device_address = ADDR, // max30102 i2c write address
        .scl_speed_hz = I2C_FREQ_HZ
    };

    i2c_master_dev_handle_t i2c_max30102_handle;
    res = ( i2c_master_bus_add_device(i2c_bus_handle, &i2c_max30102_config, &i2c_max30102_handle) ); // add max30102 to master bus as a slave device
    printf("device: %s\n", esp_err_to_name(res));

    max30102_set_mode(i2c_max30102_handle, max30102_reset_mode);

    max30102_config(i2c_max30102_handle);

    while (1) {
        vTaskDelay(pdMS_TO_TICKS(5000)); // 5000 ms = 5 s delay between polling cycles
        polling_num++;
        printf("polling_num: %ld\n", polling_num);   
        max30102_read_fifo(i2c_max30102_handle);
    }
}

esp_err_t max30102_read(i2c_master_dev_handle_t *dev_handle, uint8_t reg, uint8_t *buf, uint16_t buflen)
{
    vTaskDelay(pdMS_TO_TICKS(10));

    // Transmit the register address over I2C
    esp_err_t res = i2c_master_transmit(dev_handle, &reg, 1, -1);
    if (res != ESP_OK) {
        printf("I2C write error: %s\n", esp_err_to_name(res));
        return res;
    }

    // Receive data from the I2C device
    res = i2c_master_receive(dev_handle, buf, buflen, -1);
    res = ESP_OK;
    if (res != ESP_OK) {
        printf("I2C read error: %s\n", esp_err_to_name(res));
    }

    vTaskDelay(pdMS_TO_TICKS(10));

    return res;
}

esp_err_t max30102_write(i2c_master_dev_handle_t *dev_handle, uint8_t reg, uint8_t *buf, uint16_t buflen) 
{

    vTaskDelay(pdMS_TO_TICKS(10));

    // Allocate memory for the payload (register address + data)
    uint8_t *payload = (uint8_t *) malloc((buflen + 1) * sizeof(uint8_t));
    if (payload == NULL) {
        printf("Memory allocation failed\n");
        return ESP_ERR_NO_MEM;
    }

    // Set the register address
    payload[0] = reg;

    // If there's data to be written, copy it into the payload
    if (buf != NULL && buflen != 0) {
        memcpy(payload + 1, buf, buflen);
    }

    // Transmit data over I2C
    esp_err_t err = i2c_master_transmit(dev_handle, payload, buflen + 1, -1);
    if (err != ESP_OK) {
        printf("I2C transmit error: %s\n", esp_err_to_name(err));
    }

    // Free the allocated memory
    free(payload);

    vTaskDelay(pdMS_TO_TICKS(10));

    return err;
}

void max30102_reset(i2c_master_dev_handle_t *dev_handle){
    uint8_t val = 0x40;
    max30102_write(dev_handle, MAX30102_MODE_CONFIG, &val, 1);
}

void max30102_clear_fifo(i2c_master_dev_handle_t *dev_handle){
    uint8_t val = 0x00;
    max30102_write(dev_handle, MAX30102_FIFO_WR_PTR, &val, 3);
    max30102_write(dev_handle, MAX30102_FIFO_RD_PTR, &val, 3);
    max30102_write(dev_handle, MAX30102_OVF_COUNTER, &val, 3);
}

void max30102_set_fifo_config(i2c_master_dev_handle_t *dev_handle, max30102_smp_ave_t smp_ave, uint8_t roll_over_en, uint8_t fifo_a_full)
{
    uint8_t config = 0x00;
    config |= smp_ave << MAX30102_FIFO_CONFIG_SMP_AVE;
    config |= ((roll_over_en & 0x01) << MAX30102_FIFO_CONFIG_ROLL_OVER_EN);
    config |= ((fifo_a_full & 0x0f) << MAX30102_FIFO_CONFIG_FIFO_A_FULL);
    max30102_write(dev_handle, MAX30102_FIFO_CONFIG, &config, 1);
}

void max30102_set_led_pulse_width(i2c_master_dev_handle_t *dev_handle, max30102_led_pw_t pw)
{
    uint8_t config;
    max30102_read(dev_handle, MAX30102_SPO2_CONFIG, &config, 1);
    config = (config & 0x7c) | (pw << MAX30102_SPO2_LEW_PW);
    max30102_write(dev_handle, MAX30102_SPO2_CONFIG, &config, 1);
}

void max30102_set_adc_resolution(i2c_master_dev_handle_t *dev_handle, max30102_adc_t adc){
    uint8_t config;
    esp_err_t err = max30102_read(dev_handle, MAX30102_SPO2_CONFIG, &config, 1);
    if (err != ESP_OK) {
        printf("Failed to read SPO2 config: %s\n", esp_err_to_name(err));
        return;
    }

    config = (config & 0x1F) | (adc << MAX30102_SPO2_ADC_RGE);

    err = max30102_write(dev_handle, MAX30102_SPO2_CONFIG, &config, 1);
    if (err != ESP_OK) {
        printf("Failed to write SPO2 config: %s\n", esp_err_to_name(err));
    } else {
        printf("ADC resolution set successfully\n");
    }
}


void max30102_set_sampling_rate(i2c_master_dev_handle_t *dev_handle, max30102_sr_t sr)
{
    uint8_t config;
    max30102_read(dev_handle, MAX30102_SPO2_CONFIG, &config, 1);
    config = (config & 0x63) | (sr << MAX30102_SPO2_SR);
    max30102_write(dev_handle, MAX30102_SPO2_CONFIG, &config, 1);
}

void max30102_set_led_current_1(i2c_master_dev_handle_t *dev_handle, float ma)
{
    uint8_t pa = ma / 0.2;
    max30102_write(dev_handle, MAX30102_LED_IR_PA1, &pa, 1);
}

void max30102_set_led_current_2(i2c_master_dev_handle_t *dev_handle, float ma)
{
    uint8_t pa = ma / 0.2;
    max30102_write(dev_handle, MAX30102_LED_RED_PA2, &pa, 1);
}

void max30102_set_mode(i2c_master_dev_handle_t *dev_handle, max30102_mode_t mode)
{
    uint8_t config;
    max30102_read(dev_handle, MAX30102_MODE_CONFIG, &config, 1);
    config = (config & 0xf8) | mode;
    max30102_write(dev_handle, MAX30102_MODE_CONFIG, &config, 1);
    max30102_clear_fifo(dev_handle);
}

void max30102_reset_wr_rd_ptr(i2c_master_dev_handle_t *dev_handle){
    uint8_t reset = 0x00;
    max30102_write(dev_handle, MAX30102_FIFO_WR_PTR, &reset, 3);
    max30102_write(dev_handle, MAX30102_FIFO_WR_PTR, &reset, 3);
}

void max30102_read_fifo(i2c_master_dev_handle_t *dev_handle){
    uint8_t reset = 0x00;
    uint8_t rd_ptr = 0, wr_ptr = 0;

    uint8_t sample[6];
    max30102_read(dev_handle, MAX30102_FIFO_DATA, sample, 6);
    uint32_t ir_sample = ((uint32_t) (sample[3] << 16) | (uint32_t) (sample[4] << 8) | (uint32_t) (sample[5])) & 0x3ffff;
        
    printf("\navg reading: %ld\n", ir_sample);

    ir_sample = 5;

    xQueueSend(pulse_queue, &ir_sample, portMAX_DELAY); // send to queue

    printf("sent");

    max30102_clear_fifo(dev_handle);
}

void max30102_set_a_full(i2c_master_dev_handle_t *dev_handle, uint8_t enable)
{
    uint8_t reg = 0;
    max30102_read(dev_handle, MAX30102_INTERRUPT_ENABLE_1, &reg, 1);
    reg &= ~(0x01 << MAX30102_INTERRUPT_A_FULL);
    reg |= ((enable & 0x01) << MAX30102_INTERRUPT_A_FULL);
    max30102_write(dev_handle, MAX30102_INTERRUPT_ENABLE_1, &reg, 1);
}

void max30102_set_die_temp_en(i2c_master_dev_handle_t *dev_handle, uint8_t enable)
{
    uint8_t reg = (enable & 0x01) << MAX30102_DIE_TEMP_EN;
    max30102_write(dev_handle, MAX30102_DIE_TEMP_CONFIG, &reg, 1);
}


void max30102_set_die_temp_rdy(i2c_master_dev_handle_t *dev_handle, uint8_t enable)
{
    uint8_t reg = (enable & 0x01) << MAX30102_INTERRUPT_DIE_TEMP_RDY;
    max30102_write(*dev_handle, MAX30102_INTERRUPT_ENABLE_2, &reg, 1);
}

void max30102_config(i2c_master_dev_handle_t *dev_handle){
    // reset sensor and clear FIFO pointers
    max30102_reset(dev_handle);
    max30102_clear_fifo(dev_handle);

    // FIFO config
    max30102_set_fifo_config(dev_handle, max30102_smp_ave_1, 1, 7);
    printf("fifo configured\n");

    // LED configurations
    max30102_set_led_pulse_width(dev_handle, max30102_pw_16_bit);
    printf("led pulse width set\n");

    max30102_set_sampling_rate(dev_handle, max30102_sr_800);
    printf("sampling rate set\n");

    max30102_set_adc_resolution(dev_handle, max30102_adc_2048);
    printf("adc resolution set\n");

    max30102_set_led_current_1(dev_handle, 6.2);
    printf("led current 1 set\n");

    max30102_set_led_current_2(dev_handle, 6.2);
    printf("led current 2 set\n");

    max30102_set_mode(dev_handle, max30102_spo2);
    printf("led mode set\n");

    printf("done configuration\n");

}