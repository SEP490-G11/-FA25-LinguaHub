package edu.lms.configuration;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "mbbank")
@Getter
@Setter
public class MBBankConfig {
    private String accountNo;
    private String authorization;
    private String cookie;
}
