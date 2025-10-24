//package edu.lms.service;
//
//import jakarta.servlet.http.HttpSession;
//
//import edu.lms.dto.request.*;
//import edu.lms.dto.response.AuthenticationReponse;
//import edu.lms.dto.response.IntrospectResponse;
//import edu.lms.entity.*;
//import edu.lms.exception.AppException;
//import edu.lms.exception.ErrorCode;
//import edu.lms.repository.*;
//import com.nimbusds.jose.*;
//import com.nimbusds.jose.crypto.MACSigner;
//import com.nimbusds.jose.crypto.MACVerifier;
//import com.nimbusds.jwt.JWTClaimsSet;
//import com.nimbusds.jwt.SignedJWT;
//import jakarta.transaction.Transactional;
//import lombok.AccessLevel;
//import lombok.RequiredArgsConstructor;
//import lombok.experimental.FieldDefaults;
//import lombok.experimental.NonFinal;
//import lombok.extern.slf4j.Slf4j;
//import org.springframework.beans.factory.annotation.Value;
//import org.springframework.security.core.context.SecurityContextHolder;
//import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
//import org.springframework.security.crypto.password.PasswordEncoder;
//import org.springframework.stereotype.Service;
//import org.springframework.util.StringUtils;
//
//import java.text.ParseException;
//import java.time.Instant;
//import java.time.LocalDateTime;
//import java.time.temporal.ChronoUnit;
//import java.util.*;
//import java.util.stream.Collectors;
//
//@Slf4j
//@Service
//@RequiredArgsConstructor
//@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
//public class AuthenticationService {
//    final HttpSession session;
//
//    UserRepository userRepository;
//    InvalidatedTokenRepository invalidatedTokenRepository;
//    RoleRepository roleRepository;
//    VerificationRepository verificationRepository;
//    EmailService emailService;
//
//    @NonFinal
//    @Value("${jwt.signerKey}")
//    protected String SIGNER_KEY;
//
//    public void register(UserCreationRequest request) {
//        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
//            throw new AppException(ErrorCode.USER_EXISTED);
//        }
//
//        PasswordEncoder passwordEncoder = new BCryptPasswordEncoder(10);
//        String hashedPassword = passwordEncoder.encode(request.getPassword());
//
//        Role role = roleRepository.findByName("Learner")
//                .orElseThrow(() -> new AppException(ErrorCode.ROLE_NOT_FOUND));
//
//        String otp = String.valueOf(new Random().nextInt(900000) + 100000);
//        emailService.sendOtp(request.getEmail(), otp);
//
//        Verification verification = Verification.builder()
//                .email(request.getEmail())
//                .username(request.getUsername())
//                .fullName(request.getFullName())
//                .passwordHash(hashedPassword)
//                .gender(request.getGender())
//                .dob(request.getDob())
//                .phone(request.getPhone())
//                .country(request.getCountry())
//                .address(request.getAddress())
//                .bio(request.getBio())
//                .otp(otp)
//                .expiresAt(LocalDateTime.now().plusMinutes(5))
//                .build();
//
//        verificationRepository.save(verification);
//    }
//
//    public void verifyEmail(String email, String otp) {
//        Verification verification = verificationRepository.findByEmailAndOtp(email, otp)
//                .orElseThrow(() -> new AppException(ErrorCode.INVALID_OTP));
//
//        if (verification.getExpiresAt().isBefore(LocalDateTime.now()))
//            throw new AppException(ErrorCode.OTP_EXPIRED);
//
//        Role role = roleRepository.findByName("Learner")
//                .orElseThrow(() -> new AppException(ErrorCode.ROLE_NOT_FOUND));
//
//        User user = User.builder()
//                .email(verification.getEmail())
//                .username(verification.getUsername())
//                .fullName(verification.getFullName())
//                .passwordHash(verification.getPasswordHash())
//                .role(role)
//                .gender(verification.getGender())
//                .dob(verification.getDob())
//                .phone(verification.getPhone())
//                .country(verification.getCountry())
//                .address(verification.getAddress())
//                .bio(verification.getBio())
//                .isActive(true)
//                .build();
//
//        userRepository.save(user);
//        verificationRepository.delete(verification);
//    }
//
//    public AuthenticationReponse authenticate(AuthenticationRequest request) {
//        PasswordEncoder passwordEncoder = new BCryptPasswordEncoder(10);
//
//        User user = userRepository.findByEmail(request.getUsername())
//                .or(() -> userRepository.findByUsername(request.getUsername()))
//                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXIST));
//
//        if (!Boolean.TRUE.equals(user.getIsActive())) {
//            throw new AppException(ErrorCode.UNAUTHENTICATED);
//        }
//
//        boolean authenticated = passwordEncoder.matches(request.getPassword(), user.getPasswordHash());
//        if (!authenticated) throw new AppException(ErrorCode.UNAUTHENTICATED);
//
//        String token = generateToken(user);
//
//        return AuthenticationReponse.builder()
//                .token(token)
//                .authenticated(true)
//                .build();
//    }
//
//    private String generateToken(User user) {
//        JWSHeader header = new JWSHeader(JWSAlgorithm.HS512);
//
//        List<String> permissions = user.getRole().getPermissions()
//                .stream()
//                .map(Permission::getName)
//                .collect(Collectors.toList());
//
//        JWTClaimsSet claims = new JWTClaimsSet.Builder()
//                .subject(StringUtils.hasText(user.getEmail()) ? user.getEmail() : user.getUsername())
//                .issuer("linguahub.com")
//                .issueTime(new Date())
//                .expirationTime(Date.from(Instant.now().plus(1, ChronoUnit.HOURS)))
//                .jwtID(UUID.randomUUID().toString())
//                .claim("role", user.getRole().getName())
//                .claim("permissions", permissions)
//                .build();
//
//        try {
//            JWSObject jwsObject = new JWSObject(header, new Payload(claims.toJSONObject()));
//            jwsObject.sign(new MACSigner(SIGNER_KEY.getBytes()));
//            return jwsObject.serialize();
//        } catch (JOSEException e) {
//            log.error("Cannot create token", e);
//            throw new RuntimeException("Failed to create token", e);
//        }
//    }
//
//    public IntrospectResponse introspect(IntrospectRequest request) throws JOSEException, ParseException {
//        var token = request.getToken();
//        try {
//            verifyToken(token);
//        } catch (AppException e) {
//            return IntrospectResponse.builder().valid(false).build();
//        }
//        return IntrospectResponse.builder().valid(true).build();
//    }
//
//    public void logout(LogoutRequest request) throws ParseException, JOSEException {
//        var signedToken = verifyToken(request.getToken());
//        String jit = signedToken.getJWTClaimsSet().getJWTID();
//        Date expirationDate = signedToken.getJWTClaimsSet().getExpirationTime();
//
//        InvalidatedToken invalidatedToken = InvalidatedToken.builder()
//                .id(jit)
//                .expiryTime(expirationDate)
//                .build();
//
//        invalidatedTokenRepository.save(invalidatedToken);
//    }
//
//    private SignedJWT verifyToken(String token) throws ParseException, JOSEException {
//        JWSVerifier verifier = new MACVerifier(SIGNER_KEY.getBytes());
//        SignedJWT signedJWT = SignedJWT.parse(token);
//
//        Date exp = signedJWT.getJWTClaimsSet().getExpirationTime();
//        boolean verified = signedJWT.verify(verifier);
//
//        if (!(verified && exp.after(new Date())))
//            throw new AppException(ErrorCode.UNAUTHENTICATED);
//
//        if (invalidatedTokenRepository.existsById(signedJWT.getJWTClaimsSet().getJWTID()))
//            throw new AppException(ErrorCode.UNAUTHENTICATED);
//
//        return signedJWT;
//    }
//
//    public void forgotPassword(ForgotPasswordRequest request) {
//        User user = userRepository.findByEmail(request.getEmail())
//                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXIST));
//
//        String otp = String.valueOf(new Random().nextInt(900000) + 100000);
//        emailService.sendOtp(user.getEmail(), otp);
//
//        verificationRepository.deleteByEmail(user.getEmail());
//
//        Verification verification = Verification.builder()
//                .email(user.getEmail())
//                .otp(otp)
//                .expiresAt(LocalDateTime.now().plusMinutes(5))
//                .build();
//        verificationRepository.save(verification);
//    }
//
//    public void verifyResetOtp(VerifyResetOtpRequest request) {
//        Verification verification = verificationRepository
//                .findByEmailAndOtp(request.getEmail(), request.getOtp())
//                .orElseThrow(() -> new AppException(ErrorCode.INVALID_OTP));
//
//        if (verification.getExpiresAt().isBefore(LocalDateTime.now()))
//            throw new AppException(ErrorCode.OTP_EXPIRED);
//
//
//        session.setAttribute("resetEmail", verification.getEmail());
//    }
//
//
//    @Transactional
//    public void setNewPassword(SetNewPasswordRequest request) {
//        String email = (String) session.getAttribute("resetEmail");
//        if (email == null) {
//            throw new AppException(ErrorCode.UNAUTHENTICATED);
//        }
//
//        User user = userRepository.findByEmail(email)
//                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXIST));
//
//        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
//            throw new AppException(ErrorCode.PASSWORD_NOT_MATCH);
//        }
//
//        PasswordEncoder encoder = new BCryptPasswordEncoder(10);
//        user.setPasswordHash(encoder.encode(request.getNewPassword()));
//        userRepository.save(user);
//
//        verificationRepository.deleteByEmail(email);
//
//        session.removeAttribute("resetEmail");
//    }
//
//
//
//    public void changePassword(ChangePasswordRequest request) {
//        String currentEmail = SecurityContextHolder.getContext().getAuthentication().getName();
//
//        User user = userRepository.findByEmail(currentEmail)
//                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXIST));
//
//        PasswordEncoder encoder = new BCryptPasswordEncoder(10);
//
//        if (!encoder.matches(request.getOldPassword(), user.getPasswordHash())) {
//            throw new AppException(ErrorCode.INVALID_PASSWORD);
//        }
//
//        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
//            throw new AppException(ErrorCode.PASSWORD_NOT_MATCH);
//        }
//
//        user.setPasswordHash(encoder.encode(request.getNewPassword()));
//        userRepository.save(user);
//    }
//}
package edu.lms.service;

import edu.lms.dto.request.*;
import edu.lms.dto.response.AuthenticationReponse;
import edu.lms.dto.response.IntrospectResponse;
import edu.lms.entity.*;
import edu.lms.exception.AppException;
import edu.lms.exception.ErrorCode;
import edu.lms.repository.*;
import jakarta.servlet.http.HttpSession;
import jakarta.transaction.Transactional;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import com.nimbusds.jose.*;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jose.crypto.MACVerifier;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;

import java.text.ParseException;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AuthenticationService {

    final HttpSession session;

    UserRepository userRepository;
    InvalidatedTokenRepository invalidatedTokenRepository;
    RoleRepository roleRepository;
    VerificationRepository verificationRepository;
    EmailService emailService;

    @NonFinal
    @Value("${jwt.signerKey}")
    protected String SIGNER_KEY;

    // ================= REGISTER =================
    @Transactional
    public void register(UserCreationRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new AppException(ErrorCode.USER_EXISTED);
        }

        PasswordEncoder passwordEncoder = new BCryptPasswordEncoder(10);
        String hashedPassword = passwordEncoder.encode(request.getPassword());

        Role role = roleRepository.findByName("Learner")
                .orElseThrow(() -> new AppException(ErrorCode.ROLE_NOT_FOUND));

        String otp = String.valueOf(new Random().nextInt(900000) + 100000);
        emailService.sendOtp(request.getEmail(), otp);

        verificationRepository.deleteByEmail(request.getEmail());

        Verification verification = Verification.builder()
                .email(request.getEmail())
                .username(request.getUsername())
                .fullName(request.getFullName())
                .passwordHash(hashedPassword)
                .gender(request.getGender())
                .dob(request.getDob())
                .phone(request.getPhone())
                .country(request.getCountry())
                .address(request.getAddress())
                .bio(request.getBio())
                .otp(otp)
                .expiresAt(LocalDateTime.now().plusMinutes(5))
                .build();

        verificationRepository.save(verification);

        //Lưu email vào session để verify OTP sau không cần truyền lại
        session.setAttribute("registerEmail", request.getEmail());
    }

    public void verifyEmail(String otp) {
        String email = (String) session.getAttribute("registerEmail");
        if (email == null) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }

        Verification verification = verificationRepository.findByEmailAndOtp(email, otp)
                .orElseThrow(() -> new AppException(ErrorCode.INVALID_OTP));

        if (verification.getExpiresAt().isBefore(LocalDateTime.now()))
            throw new AppException(ErrorCode.OTP_EXPIRED);

        Role role = roleRepository.findByName("Learner")
                .orElseThrow(() -> new AppException(ErrorCode.ROLE_NOT_FOUND));

        User user = User.builder()
                .email(verification.getEmail())
                .username(verification.getUsername())
                .fullName(verification.getFullName())
                .passwordHash(verification.getPasswordHash())
                .role(role)
                .gender(verification.getGender())
                .dob(verification.getDob())
                .phone(verification.getPhone())
                .country(verification.getCountry())
                .address(verification.getAddress())
                .bio(verification.getBio())
                .isActive(true)
                .build();

        userRepository.save(user);
        verificationRepository.delete(verification);

        // ✅ Xóa session sau khi verify xong
        session.removeAttribute("registerEmail");
    }

    // ================= LOGIN =================
    public AuthenticationReponse authenticate(AuthenticationRequest request) {
        PasswordEncoder passwordEncoder = new BCryptPasswordEncoder(10);

        User user = userRepository.findByEmail(request.getUsername())
                .or(() -> userRepository.findByUsername(request.getUsername()))
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXIST));

        if (!Boolean.TRUE.equals(user.getIsActive())) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }

        boolean authenticated = passwordEncoder.matches(request.getPassword(), user.getPasswordHash());
        if (!authenticated) throw new AppException(ErrorCode.PASSWORD_ENABLED);

        String token = generateToken(user);

        return AuthenticationReponse.builder()
                .token(token)
                .authenticated(true)
                .build();
    }

    private String generateToken(User user) {
        JWSHeader header = new JWSHeader(JWSAlgorithm.HS512);

        List<String> permissions = user.getRole().getPermissions()
                .stream()
                .map(Permission::getName)
                .collect(Collectors.toList());

        JWTClaimsSet claims = new JWTClaimsSet.Builder()
                .subject(StringUtils.hasText(user.getEmail()) ? user.getEmail() : user.getUsername())
                .issuer("linguahub.com")
                .issueTime(new Date())
                .expirationTime(Date.from(Instant.now().plus(1, ChronoUnit.HOURS)))
                .jwtID(UUID.randomUUID().toString())
                .claim("role", user.getRole().getName())
                .claim("permissions", permissions)
                .build();

        try {
            JWSObject jwsObject = new JWSObject(header, new Payload(claims.toJSONObject()));
            jwsObject.sign(new MACSigner(SIGNER_KEY.getBytes()));
            return jwsObject.serialize();
        } catch (JOSEException e) {
            log.error("Cannot create token", e);
            throw new RuntimeException("Failed to create token", e);
        }
    }

    public IntrospectResponse introspect(IntrospectRequest request) throws JOSEException, ParseException {
        var token = request.getToken();
        try {
            verifyToken(token);
        } catch (AppException e) {
            return IntrospectResponse.builder().valid(false).build();
        }
        return IntrospectResponse.builder().valid(true).build();
    }

    public void logout(LogoutRequest request) throws ParseException, JOSEException {
        var signedToken = verifyToken(request.getToken());
        String jit = signedToken.getJWTClaimsSet().getJWTID();
        Date expirationDate = signedToken.getJWTClaimsSet().getExpirationTime();

        InvalidatedToken invalidatedToken = InvalidatedToken.builder()
                .id(jit)
                .expiryTime(expirationDate)
                .build();

        invalidatedTokenRepository.save(invalidatedToken);
    }

    private SignedJWT verifyToken(String token) throws ParseException, JOSEException {
        JWSVerifier verifier = new MACVerifier(SIGNER_KEY.getBytes());
        SignedJWT signedJWT = SignedJWT.parse(token);

        Date exp = signedJWT.getJWTClaimsSet().getExpirationTime();
        boolean verified = signedJWT.verify(verifier);

        if (!(verified && exp.after(new Date())))
            throw new AppException(ErrorCode.UNAUTHENTICATED);

        if (invalidatedTokenRepository.existsById(signedJWT.getJWTClaimsSet().getJWTID()))
            throw new AppException(ErrorCode.UNAUTHENTICATED);

        return signedJWT;
    }

    // ================= FORGOT PASSWORD =================
    public void forgotPassword(ForgotPasswordRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXIST));

        String otp = String.valueOf(new Random().nextInt(900000) + 100000);
        emailService.sendOtp(user.getEmail(), otp);

        verificationRepository.deleteByEmail(user.getEmail());

        Verification verification = Verification.builder()
                .email(user.getEmail())
                .otp(otp)
                .expiresAt(LocalDateTime.now().plusMinutes(5))
                .build();
        verificationRepository.save(verification);

        // ✅ Lưu email vào session
        session.setAttribute("resetEmail", user.getEmail());
    }

    public void verifyResetOtp(VerifyResetOtpRequest request) {
        String email = (String) session.getAttribute("resetEmail");
        if (email == null) throw new AppException(ErrorCode.UNAUTHENTICATED);

        Verification verification = verificationRepository
                .findByEmailAndOtp(email, request.getOtp())
                .orElseThrow(() -> new AppException(ErrorCode.INVALID_OTP));

        if (verification.getExpiresAt().isBefore(LocalDateTime.now()))
            throw new AppException(ErrorCode.OTP_EXPIRED);

        //Lưu OTP vào session
        session.setAttribute("resetOtp", request.getOtp());
    }

    @Transactional
    public void setNewPassword(SetNewPasswordRequest request) {
        String email = (String) session.getAttribute("resetEmail");
        String otp = (String) session.getAttribute("resetOtp");

        if (email == null || otp == null)
            throw new AppException(ErrorCode.UNAUTHENTICATED);

        Verification verification = verificationRepository
                .findByEmailAndOtp(email, otp)
                .orElseThrow(() -> new AppException(ErrorCode.INVALID_OTP));

        if (!request.getNewPassword().equals(request.getConfirmPassword()))
            throw new AppException(ErrorCode.PASSWORD_NOT_MATCH);

        PasswordEncoder encoder = new BCryptPasswordEncoder(10);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXIST));

        user.setPasswordHash(encoder.encode(request.getNewPassword()));
        userRepository.save(user);
        verificationRepository.delete(verification);

        //Clear session
        session.removeAttribute("resetEmail");
        session.removeAttribute("resetOtp");
    }



}

