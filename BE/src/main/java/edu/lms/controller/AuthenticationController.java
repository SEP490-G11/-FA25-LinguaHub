package edu.lms.controller;

import edu.lms.dto.request.ApiRespond;
import edu.lms.dto.request.AuthenticationRequest;
import edu.lms.dto.request.IntrospectRequest;
import edu.lms.dto.request.LogoutRequest;
import edu.lms.dto.response.AuthenticationReponse;
import edu.lms.dto.response.IntrospectResponse;
import edu.lms.service.AuthenticationService;
import com.nimbusds.jose.JOSEException;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.*;

import java.text.ParseException;


@RestController
@RestControllerAdvice
@Builder
@RequestMapping("/auth")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AuthenticationController {
    private final AuthenticationService authenticationService;

    @PostMapping("/token")
    ApiRespond<AuthenticationReponse> authentication(@RequestBody AuthenticationRequest request) {
        var result = authenticationService.authenticate(request);
        return ApiRespond.<AuthenticationReponse>builder()
                .result(result)
                .build();
    }

    @PostMapping("/introspect")
    ApiRespond<IntrospectResponse> authentication(@RequestBody IntrospectRequest request)
            throws ParseException, JOSEException {
        var result = authenticationService.introspect(request);
        return ApiRespond.<IntrospectResponse>builder()
                .result(result)
                .build();
    }
    @PostMapping("/logout")
    ApiRespond<Void> authentication(@RequestBody LogoutRequest request)
            throws ParseException, JOSEException {
        authenticationService.logout(request);
        return ApiRespond.<Void>builder()
                .build();
    }
}
