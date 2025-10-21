package edu.lms.service;

import edu.lms.entity.User;
import edu.lms.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        // Tìm user theo email hoặc username (tùy bạn đang dùng field nào)
        User user = userRepository.findByEmail(username)
                .or(() -> userRepository.findByUsername(username))
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));

        // Trả về user cho Spring Security xử lý
        return org.springframework.security.core.userdetails.User
                .withUsername(user.getEmail() != null ? user.getEmail() : user.getUsername())
                .password(user.getPasswordHash())
                .roles(user.getRole().getName())
                .build();
    }
}
