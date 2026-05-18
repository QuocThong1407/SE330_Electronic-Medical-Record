package com.emr.emr_system.modules.auth.security;

import com.emr.emr_system.modules.auth.entity.User;
import com.emr.emr_system.modules.auth.repository.UserRepository;
import com.emr.emr_system.shared.exceptions.AuthenticationFailedException;
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
        User user = userRepository.findByEmail(username)
                .orElseThrow(() -> new AuthenticationFailedException("Invalid email or password"));
        return UserPrincipal.from(user);
    }
}
