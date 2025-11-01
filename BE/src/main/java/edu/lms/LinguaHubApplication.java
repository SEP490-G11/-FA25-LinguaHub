package edu.lms;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.time.LocalDateTime;
import java.util.TimeZone;

@SpringBootApplication
public class LinguaHubApplication {

    public static void main(String[] args) {
        //Ép toàn bộ ứng dụng chạy theo múi giờ Việt Nam (GMT+7)
        TimeZone.setDefault(TimeZone.getTimeZone("Asia/Ho_Chi_Minh"));

        SpringApplication.run(LinguaHubApplication.class, args);

        //In ra để kiểm tra
        System.out.println(">>> Default timezone set to: " + TimeZone.getDefault().getID());
        System.out.println(">>> Current time: " + LocalDateTime.now());
    }
}
