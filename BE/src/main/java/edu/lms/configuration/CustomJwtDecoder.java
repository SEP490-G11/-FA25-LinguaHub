package edu.lms.configuration;

import java.text.ParseException;
import java.util.Objects;
import javax.crypto.spec.SecretKeySpec;
import jakarta.servlet.http.HttpServletRequest;

import edu.lms.dto.request.IntrospectRequest;
import edu.lms.service.AuthenticationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import com.nimbusds.jose.JOSEException;

@Component
public class CustomJwtDecoder implements JwtDecoder {

    @Value("${jwt.signerKey}")
    private String signerKey;

    @Autowired
    private AuthenticationService authenticationService;

    private NimbusJwtDecoder nimbusJwtDecoder = null;

    @Override
    public Jwt decode(String token) throws JwtException {

        // ✅ Lấy request hiện tại
        HttpServletRequest request =
                ((ServletRequestAttributes) RequestContextHolder.getRequestAttributes()).getRequest();
        String uri = request.getRequestURI();

        // ✅ Bỏ qua decode nếu là endpoint public
        if (uri.startsWith("/api/test") || uri.startsWith("/auth") || uri.startsWith("/users")) {
            return null;
        }

        // ✅ Nếu không có token -> trả lỗi rõ ràng (để tránh decode lỗi)
        if (token == null || token.trim().isEmpty()) {
            throw new JwtException("Missing or empty token");
        }

        // ✅ Gọi service introspect để kiểm tra token
        try {
            var response = authenticationService.introspect(
                    IntrospectRequest.builder().token(token).build());

            if (!response.isValid()) {
                throw new JwtException("Token invalid");
            }
        } catch (JOSEException | ParseException e) {
            throw new JwtException(e.getMessage());
        }

        // ✅ Khởi tạo decoder nếu chưa có
        if (Objects.isNull(nimbusJwtDecoder)) {
            SecretKeySpec secretKeySpec = new SecretKeySpec(signerKey.getBytes(), "HS512");
            nimbusJwtDecoder = NimbusJwtDecoder.withSecretKey(secretKeySpec)
                    .macAlgorithm(MacAlgorithm.HS512)
                    .build();
        }

        // ✅ Giải mã JWT hợp lệ
        return nimbusJwtDecoder.decode(token);
    }
}
