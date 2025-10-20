package edu.lms.configuration;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.cors.CorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private static final String[] PUBLIC_GET_ENDPOINTS = {
            "/users", "/api/test"
    };

    private static final String[] PUBLIC_POST_ENDPOINTS = {
            "/auth/token", "/auth/introspect", "/auth/logout", "/users"
    };

    @Autowired
    private CustomJwtDecoder customJwtDecoder;

//    @Bean
//    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
//        http
//                // ✅ Cho phép CORS cho React
//                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
//                // ✅ Tắt CSRF cho API REST
//                .csrf(AbstractHttpConfigurer::disable)
//                // ✅ Cấu hình phân quyền
//                .authorizeHttpRequests(auth -> auth
//                        // Cho phép preflight (OPTIONS)
//                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
//                        // Cho phép các endpoint public (test, login, logout)
//                        .requestMatchers(HttpMethod.GET, PUBLIC_GET_ENDPOINTS).permitAll()
//                        .requestMatchers(HttpMethod.POST, PUBLIC_POST_ENDPOINTS).permitAll()
//                        // Các request còn lại cần JWT hợp lệ
//                        .anyRequest().authenticated()
//                )
//                // ✅ Cấu hình xác thực JWT (Resource Server)
//                .oauth2ResourceServer(oauth2 -> oauth2
//                        .jwt(jwtConfigurer -> jwtConfigurer
//                                .decoder(customJwtDecoder)
//                                .jwtAuthenticationConverter(jwtAuthenticationConverter()))
//                        .authenticationEntryPoint(new JwtAuthenticationEntryPoint())
//                );
//
//        return http.build();
//    }
@Bean
public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
    http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(AbstractHttpConfigurer::disable)
            .authorizeHttpRequests(auth -> auth
                    .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                    // ✅ Cho phép public các endpoint sau mà không cần token
                    .requestMatchers("/api/test", "/auth/**", "/users").permitAll()
                    // Các request khác cần xác thực JWT
                    .anyRequest().authenticated()
            )
            .oauth2ResourceServer(oauth2 -> oauth2
                    .jwt(jwtConfigurer -> jwtConfigurer
                            .decoder(customJwtDecoder)
                            .jwtAuthenticationConverter(jwtAuthenticationConverter()))
                    .authenticationEntryPoint(new JwtAuthenticationEntryPoint())
            );

    return http.build();
}


    // ✅ Cấu hình chuyển đổi JWT Authorities
    @Bean
    public JwtAuthenticationConverter jwtAuthenticationConverter() {
        JwtGrantedAuthoritiesConverter jwtGrantedAuthoritiesConverter = new JwtGrantedAuthoritiesConverter();
        jwtGrantedAuthoritiesConverter.setAuthorityPrefix("");

        JwtAuthenticationConverter jwtAuthenticationConverter = new JwtAuthenticationConverter();
        jwtAuthenticationConverter.setJwtGrantedAuthoritiesConverter(jwtGrantedAuthoritiesConverter);
        return jwtAuthenticationConverter;
    }

    // ✅ Mã hóa mật khẩu người dùng
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(10);
    }

    // ✅ Cho phép kết nối từ FE (localhost:5173)
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(List.of("http://localhost:*")); // ✅ Cho phép mọi cổng localhost
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
