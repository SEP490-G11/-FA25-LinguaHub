//package edu.lms.controller;
//
//import edu.lms.dto.request.ApiRespond;
//import edu.lms.dto.request.AuthenticationRequest;
//import edu.lms.dto.request.IntrospectRequest;
//import edu.lms.dto.request.LogoutRequest;
//import edu.lms.dto.response.AuthenticationReponse;
//import edu.lms.dto.response.IntrospectResponse;
//import edu.lms.service.AuthenticationService;
//import com.nimbusds.jose.JOSEException;
//import lombok.AccessLevel;
//import lombok.RequiredArgsConstructor;
//import lombok.experimental.FieldDefaults;
//import org.springframework.security.authentication.AuthenticationManager;
//import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
//import org.springframework.security.access.prepost.PreAuthorize;
//import org.springframework.web.bind.annotation.*;
//
//import java.text.ParseException;
//
//@RestController
//@RequestMapping("/auth")
//@RequiredArgsConstructor
//@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
//public class AuthenticationController {
//
//    AuthenticationService authenticationService;
//    AuthenticationManager authenticationManager;
//
//
//    @PostMapping("/token")
//    @PreAuthorize("permitAll()") // hoặc có thể dùng hasAuthority('LOGIN') nếu bạn cấp quyền cho cả guest
//    public ApiRespond<AuthenticationReponse> login(@RequestBody AuthenticationRequest request) {
//        authenticationManager.authenticate(
//                new UsernamePasswordAuthenticationToken(
//                        request.getUsername(),
//                        request.getPassword()
//                )
//        );
//        var result = authenticationService.authenticate(request);
//        return ApiRespond.<AuthenticationReponse>builder()
//                .result(result)
//                .build();
//    }
//
//
//    @PostMapping("/introspect")
//    @PreAuthorize("hasAuthority('INTROSPECT_TOKEN')")
//    public ApiRespond<IntrospectResponse> introspect(@RequestBody IntrospectRequest request)
//            throws ParseException, JOSEException {
//        var result = authenticationService.introspect(request);
//        return ApiRespond.<IntrospectResponse>builder()
//                .result(result)
//                .build();
//    }
//
//    //Đăng xuất (chỉ user đã đăng nhập)
//    @PostMapping("/logout")
//    @PreAuthorize("hasAuthority('LOGOUT')")
//    public ApiRespond<Void> logout(@RequestBody LogoutRequest request)
//            throws ParseException, JOSEException {
//        authenticationService.logout(request);
//        return ApiRespond.<Void>builder()
//                .message("Logged out successfully.")
//                .build();
//    }
//}
package edu.lms.controller;

import edu.lms.dto.request.*;
import edu.lms.dto.response.AuthenticationReponse;
import edu.lms.dto.response.IntrospectResponse;
import edu.lms.service.AuthenticationService;
import com.nimbusds.jose.JOSEException;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.text.ParseException;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AuthenticationController {

    AuthenticationService authenticationService;
    AuthenticationManager authenticationManager;

    // ===================== REGISTER =====================

    @PostMapping("/register")
    @PreAuthorize("permitAll()")
    public ApiRespond<Void> register(@RequestBody UserCreationRequest request) {
        authenticationService.register(request);
        return ApiRespond.<Void>builder()
                .message("OTP sent successfully to " + request.getEmail())
                .build();
    }

    // ===================== VERIFY EMAIL =====================

    @PostMapping("/verify")
    @PreAuthorize("permitAll()")
    public ApiRespond<Void> verifyEmail(
            @RequestParam String email,
            @RequestParam String otp
    ) {
        authenticationService.verifyEmail(email, otp);
        return ApiRespond.<Void>builder()
                .message("Email verified successfully. Account created!")
                .build();
    }

    // ===================== LOGIN =====================

    @PostMapping("/token")
    @PreAuthorize("permitAll()")
    public ApiRespond<AuthenticationReponse> login(@RequestBody AuthenticationRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getUsername(),
                        request.getPassword()
                )
        );
        var result = authenticationService.authenticate(request);
        return ApiRespond.<AuthenticationReponse>builder()
                .result(result)
                .build();
    }

    // ===================== INTROSPECT =====================

    @PostMapping("/introspect")
    @PreAuthorize("hasAuthority('INTROSPECT_TOKEN')")
    public ApiRespond<IntrospectResponse> introspect(@RequestBody IntrospectRequest request)
            throws ParseException, JOSEException {
        var result = authenticationService.introspect(request);
        return ApiRespond.<IntrospectResponse>builder()
                .result(result)
                .build();
    }

    // ===================== LOGOUT =====================

    @PostMapping("/logout")
    @PreAuthorize("hasAuthority('LOGOUT')")
    public ApiRespond<Void> logout(@RequestBody LogoutRequest request)
            throws ParseException, JOSEException {
        authenticationService.logout(request);
        return ApiRespond.<Void>builder()
                .message("Logged out successfully.")
                .build();
    }
}

