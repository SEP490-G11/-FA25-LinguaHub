package edu.lms.configuration;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.web.BearerTokenResolver;
import org.springframework.security.oauth2.server.resource.web.DefaultBearerTokenResolver;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.ArrayList;
import java.util.List;
import java.util.function.Predicate;
import java.util.stream.Collectors;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    @Autowired
    private CustomJwtDecoder customJwtDecoder;

    // TẤT CẢ ENDPOINT CÔNG KHAI (fixed full)
    private static final String[] PUBLIC_ENDPOINTS = {
            "/swagger-ui.html",
            "/swagger-ui/**",
            "/swagger-resources/**",
            "/v3/api-docs",
            "/v3/api-docs/**",
            "/v3/api-docs.yaml",
            "/webjars/**",
            "/configuration/ui",
            "/configuration/security",

            "/auth/**",
            "/api/test/**",

            //  PAYMENT PUBLIC ENDPOINTS
            "/api/payments/create",
            "/api/payments/webhook",
            "/api/payments/success",
            "/api/payments/cancel",
            "/tutor/courses/all"
    };

    // SecurityConfig.java
    @Bean
    public BearerTokenResolver bearerTokenResolver() {
        DefaultBearerTokenResolver delegate = new DefaultBearerTokenResolver();
        delegate.setAllowUriQueryParameter(true); // nếu đôi khi gửi access_token qua query

        Predicate<String> isPublicPath = path ->
                path.startsWith("/courses/public/") ||
                        path.startsWith("/courses/detail/") ||
                        path.startsWith("/v3/api-docs") ||
                        path.startsWith("/swagger-ui");

        return request -> {
            // 1) Nếu có Authorization: Bearer ... => LUÔN trả token để xác thực
            String token = delegate.resolve(request);
            if (token != null && !token.isBlank()) {
                return token;
            }

            // 2) Nếu không có token và là public path => cho qua như guest
            String path = request.getRequestURI();
            if (isPublicPath.test(path)) {
                return null; // anonymous user
            }

            // 3) Các path khác vẫn yêu cầu token
            return null;
        };
    }


    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(AbstractHttpConfigurer::disable)
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        // Public GET
                        .requestMatchers(HttpMethod.GET, "/courses/public/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/courses/detail/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/categories/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/tutors/approved").permitAll()
                        .requestMatchers(HttpMethod.GET, "/tutors/*").permitAll()

                        // Tutor package public endpoints
                        .requestMatchers(HttpMethod.GET, "/tutor/package/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/tutor/*/packages").permitAll()
                        // Tutor booking plan public endpoints
                        .requestMatchers(HttpMethod.GET, "/tutor/*/booking-plan").permitAll()
                        .requestMatchers(HttpMethod.GET, "/tutor/booking-plan/**").permitAll()


                        // Other public
                        .requestMatchers(PUBLIC_ENDPOINTS).permitAll()
                        // Everything else
                        .anyRequest().authenticated()
                )
                .oauth2ResourceServer(oauth2 -> oauth2
                        .jwt(jwt -> jwt
                                .decoder(customJwtDecoder)
                                .jwtAuthenticationConverter(jwtAuthenticationConverter()))
                        .bearerTokenResolver(bearerTokenResolver())
                        .authenticationEntryPoint(new JwtAuthenticationEntryPoint())
                );

        return http.build();
    }


    @Bean
    public JwtAuthenticationConverter jwtAuthenticationConverter() {
        JwtAuthenticationConverter converter = new JwtAuthenticationConverter();
        converter.setJwtGrantedAuthoritiesConverter(jwt -> {
            List<String> authorities = new ArrayList<>();

            List<String> permissions = jwt.getClaimAsStringList("permissions");
            if (permissions != null) authorities.addAll(permissions);

            String role = jwt.getClaimAsString("role");
            if (role != null) authorities.add("ROLE_" + role.toUpperCase());

            return authorities.stream()
                    .map(SimpleGrantedAuthority::new)
                    .collect(Collectors.toList());
        });
        return converter;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig)
            throws Exception {
        return authConfig.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(10);
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(
                List.of("http://localhost:*", "http://127.0.0.1:*", "https://*.ngrok-free.dev")
        );
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
