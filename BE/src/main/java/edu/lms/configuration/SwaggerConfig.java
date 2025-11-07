package edu.lms.configuration;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI lmsOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("LMS Authentication API")
                        .version("1.0.0")
                        .description("""
                                 **Mô tả ngắn gọn:**
                                API phục vụ chức năng đăng ký, xác thực và quản lý đăng nhập người dùng trong hệ thống LMS.
                                
                                Bao gồm các chức năng:
                                - Đăng ký & xác thực email
                                - Đăng nhập & sinh token
                                - Kiểm tra token hợp lệ (introspect)
                                - Đăng xuất khỏi hệ thống
                                """)
                        .contact(new Contact()
                                .name("Nguyễn Trung")
                                .email("support@lms.edu.vn"))
                        .license(new License()
                                .name("MIT License")
                                .url("https://opensource.org/licenses/MIT"))
                )
                .servers(List.of(
                        new Server().url("http://localhost:8080").description("Local Server")
                ));
    }
}
//http://localhost:8080/swagger-ui/index.html (link lấy swagger)
