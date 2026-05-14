package com.edulearn.discnotif;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@SpringBootApplication
@EnableDiscoveryClient
public class DiscNotifServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(DiscNotifServiceApplication.class, args);
    }
}
