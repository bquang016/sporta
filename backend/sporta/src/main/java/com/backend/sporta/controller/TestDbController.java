package com.backend.sporta.controller;

import com.backend.sporta.repository.OwnerRegistrationRepository;
import com.backend.sporta.entity.OwnerRegistration;
import com.backend.sporta.repository.OwnerContractRepository;
import com.backend.sporta.entity.OwnerContract;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/test-db")
public class TestDbController {

    @Autowired
    private OwnerRegistrationRepository regRepo;
    
    @Autowired
    private OwnerContractRepository contractRepo;

    @GetMapping
    public Map<String, Object> testDb() {
        Map<String, Object> result = new HashMap<>();
        List<OwnerRegistration> regs = regRepo.findAll();
        result.put("total_registrations", regs.size());
        if (!regs.isEmpty()) {
            OwnerRegistration last = regs.get(regs.size() - 1);
            result.put("last_reg_id", last.getId());
            result.put("last_reg_isContractSigned", last.getIsContractSigned());
            result.put("last_reg_status", last.getStatus());
        }
        
        List<OwnerContract> contracts = contractRepo.findAll();
        result.put("total_contracts", contracts.size());
        
        return result;
    }
}
