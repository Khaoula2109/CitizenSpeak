package com.example.Backend_CitizenSpeak.services;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import lombok.Getter;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;

@Getter
@Service
public class TokenService {

    private static final String SECRET_KEY = "MySuperSecretKeyForJWTMySuperSecretKeyForJWT";
    private static final long EXPIRATION_TIME = 1000 * 60 * 60 * 1;

    private final SecretKey key = Keys.hmacShaKeyFor(SECRET_KEY.getBytes());

    public String generateToken(String email, String role) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + EXPIRATION_TIME);

        return Jwts.builder()
                .setSubject(email)
                .claim("role", role)
                .setIssuedAt(now)
                .setExpiration(expiry)
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    public String extractEmailFromToken(String token) {
        try {
            System.out.println("Extracting email from token...");

            Claims claims;
            try {
                claims = Jwts.parserBuilder()
                        .setSigningKey(key)
                        .build()
                        .parseClaimsJws(token)
                        .getBody();
            } catch (Exception e) {
                claims = Jwts.parser()
                        .setSigningKey(getKey())
                        .parseClaimsJws(token)
                        .getBody();
            }

            String email = claims.getSubject();
            System.out.println("Email extracted: " + email);
            return email;

        } catch (ExpiredJwtException e) {
            System.err.println("Token expired: " + e.getMessage());
            return null;
        } catch (JwtException e) {
            System.err.println("Invalid JWT token: " + e.getMessage());
            return null;
        } catch (Exception e) {
            System.err.println("Error extracting email from token: " + e.getMessage());
            return null;
        }
    }

    public String extractUsername(String token) {
        try {
            return Jwts.parserBuilder()
                    .setSigningKey(key)
                    .build()
                    .parseClaimsJws(token)
                    .getBody()
                    .getSubject();
        } catch (Exception e) {
            try {
                return Jwts.parser()
                        .setSigningKey(key)
                        .parseClaimsJws(token)
                        .getBody()
                        .getSubject();
            } catch (Exception ex) {
                System.err.println("Error extracting username from token: " + ex.getMessage());
                return extractEmailFromToken(token);
            }
        }
    }

    public String extractRole(String token) {
        try {
            return Jwts.parserBuilder()
                    .setSigningKey(key)
                    .build()
                    .parseClaimsJws(token)
                    .getBody()
                    .get("role", String.class);
        } catch (Exception e) {
            try {
                return Jwts.parser()
                        .setSigningKey(key)
                        .parseClaimsJws(token)
                        .getBody()
                        .get("role", String.class);
            } catch (Exception ex) {
                System.err.println("Error extracting role from token: " + ex.getMessage());
                return null;
            }
        }
    }

    public boolean isTokenValid(String token) {
        try {
            Jwts.parserBuilder()
                    .setSigningKey(key)
                    .build()
                    .parseClaimsJws(token);
            return true;
        } catch (Exception e) {
            try {
                Jwts.parser()
                        .setSigningKey(key)
                        .parseClaimsJws(token);
                return true;
            } catch (Exception ex) {
                return false;
            }
        }
    }

    public boolean isTokenExpired(String token) {
        try {
            Claims claims;
            try {
                claims = Jwts.parserBuilder()
                        .setSigningKey(key)
                        .build()
                        .parseClaimsJws(token)
                        .getBody();
            } catch (Exception e) {
                claims = Jwts.parser()
                        .setSigningKey(key)
                        .parseClaimsJws(token)
                        .getBody();
            }

            return claims.getExpiration().before(new Date());
        } catch (ExpiredJwtException e) {
            return true;
        } catch (Exception e) {
            return true;
        }
    }

    public Date getExpirationDate(String token) {
        try {
            Claims claims;
            try {
                claims = Jwts.parserBuilder()
                        .setSigningKey(key)
                        .build()
                        .parseClaimsJws(token)
                        .getBody();
            } catch (Exception e) {
                claims = Jwts.parser()
                        .setSigningKey(key)
                        .parseClaimsJws(token)
                        .getBody();
            }

            return claims.getExpiration();
        } catch (Exception e) {
            System.err.println("Error getting expiration date: " + e.getMessage());
            return null;
        }
    }

    public Claims extractAllClaims(String token) {
        try {
            return Jwts.parserBuilder()
                    .setSigningKey(key)
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
        } catch (Exception e) {
            try {
                return Jwts.parser()
                        .setSigningKey(key)
                        .parseClaimsJws(token)
                        .getBody();
            } catch (Exception ex) {
                System.err.println("Error extracting all claims: " + ex.getMessage());
                return null;
            }
        }
    }

    public String generateTokenWithCustomExpiration(String email, String role, long expirationTime) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + expirationTime);

        return Jwts.builder()
                .setSubject(email)
                .claim("role", role)
                .setIssuedAt(now)
                .setExpiration(expiry)
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    public String generateRefreshToken(String email) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + (EXPIRATION_TIME * 24 * 7));

        return Jwts.builder()
                .setSubject(email)
                .claim("type", "refresh")
                .setIssuedAt(now)
                .setExpiration(expiry)
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    public boolean validateTokenWithUser(String token, String email) {
        try {
            String tokenEmail = extractEmailFromToken(token);
            return email.equals(tokenEmail) && !isTokenExpired(token);
        } catch (Exception e) {
            return false;
        }
    }

    public SecretKey getKey() {
        return key;
    }

    public long getExpirationTime() {
        return EXPIRATION_TIME;
    }
}