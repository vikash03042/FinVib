package com.example.project.service;

import com.example.project.repository.ExpenseRepository;
import com.example.project.repository.IncomeRepository;
import com.example.project.repository.entity.Expense;
import com.example.project.repository.entity.Income;
import com.example.project.repository.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class FinanceService {

    private final ExpenseRepository expenseRepository;
    private final IncomeRepository incomeRepository;
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("MMM dd, yyyy");

    // EXPENSES CRUD
    public Expense saveExpense(Expense expense, User user) {
        if (expense.getDate() == null) {
            expense.setDate(LocalDate.now());
        }
        expense.setUser(user);
        return expenseRepository.save(expense);
    }

    public List<Expense> getAllExpenses(User user) {
        return expenseRepository.findAllByUserIdOrderByDateDesc(user.getId());
    }

    public void deleteExpense(Long id, User user) {
        expenseRepository.findById(id).ifPresent(expense -> {
            if (expense.getUser().getId().equals(user.getId())) {
                expenseRepository.deleteById(id);
            }
        });
    }

    // EXPENSES AGGREGATIONS
    public BigDecimal getTotalExpenseSum(User user) {
        return expenseRepository.findAllByUserIdOrderByDateDesc(user.getId()).stream()
                .map(Expense::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    public BigDecimal getTodayExpenseSum(User user) {
        return expenseRepository.findByUserIdAndDate(user.getId(), LocalDate.now()).stream()
                .map(Expense::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    public BigDecimal getWeeklyExpenseSum(User user) {
        LocalDate end = LocalDate.now();
        LocalDate start = end.minusDays(6); // last 7 days
        return expenseRepository.findByUserIdAndDateBetween(user.getId(), start, end).stream()
                .map(Expense::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    public BigDecimal getMonthlyExpenseSum(User user) {
        LocalDate end = LocalDate.now();
        LocalDate start = end.withDayOfMonth(1); // current month start
        return expenseRepository.findByUserIdAndDateBetween(user.getId(), start, end).stream()
                .map(Expense::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    // INCOME CRUD
    public Income saveIncome(Income income, User user) {
        if (income.getDate() == null) {
            income.setDate(LocalDate.now());
        }
        income.setUser(user);
        return incomeRepository.save(income);
    }

    public List<Income> getAllIncomes(User user) {
        return incomeRepository.findAllByUserIdOrderByDateDesc(user.getId());
    }

    public void deleteIncome(Long id, User user) {
        incomeRepository.findById(id).ifPresent(income -> {
            if (income.getUser().getId().equals(user.getId())) {
                incomeRepository.deleteById(id);
            }
        });
    }

    public BigDecimal getTotalIncomeSum(User user) {
        return incomeRepository.findAllByUserIdOrderByDateDesc(user.getId()).stream()
                .map(Income::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    // CHATBOT SIMPLIFIED MATCHING
    public String processChat(String userMessage, User user) {
        if (userMessage == null || userMessage.trim().isEmpty()) {
            return "Hello! How can I assist you with your finances today? Try asking about your current balance, today's expenses, weekly totals, or recent transactions.";
        }

        String messageLower = userMessage.toLowerCase();

        // 1. Current balance query
        if (messageLower.contains("balance")) {
            BigDecimal balance = getTotalIncomeSum(user).subtract(getTotalExpenseSum(user));
            return String.format("🏦 Your current balance is **₹%s**.",
                    balance.setScale(2, BigDecimal.ROUND_HALF_UP));
        }

        // 2. Today's expense query
        if (messageLower.contains("today") && messageLower.contains("expense")) {
            BigDecimal todaySum = getTodayExpenseSum(user);
            return String.format("💵 Your total expense today (%s) is **₹%s**.", 
                    LocalDate.now().format(DATE_FORMATTER), todaySum.setScale(2, BigDecimal.ROUND_HALF_UP));
        }

        // 3. Weekly expense query
        if ((messageLower.contains("weekly") || messageLower.contains("week")) && messageLower.contains("expense")) {
            BigDecimal weeklySum = getWeeklyExpenseSum(user);
            LocalDate start = LocalDate.now().minusDays(6);
            return String.format("📊 Your total expense for the last 7 days (from %s to %s) is **₹%s**.",
                    start.format(DATE_FORMATTER), LocalDate.now().format(DATE_FORMATTER), weeklySum.setScale(2, BigDecimal.ROUND_HALF_UP));
        }

        // 4. Last transaction query
        if (messageLower.contains("last") || messageLower.contains("latest") || messageLower.contains("recent") || messageLower.contains("transaction")) {
            List<Expense> expenses = expenseRepository.findAllByUserIdOrderByDateDesc(user.getId());
            List<Income> incomes = incomeRepository.findAllByUserIdOrderByDateDesc(user.getId());

            Optional<Expense> lastExpense = expenses.stream().findFirst();
            Optional<Income> lastIncome = incomes.stream().findFirst();

            if (lastExpense.isEmpty() && lastIncome.isEmpty()) {
                return "🔍 You don't have any transaction history yet.";
            }

            // Compare dates to see which is newer
            if (lastExpense.isPresent() && lastIncome.isPresent()) {
                if (lastExpense.get().getDate().isAfter(lastIncome.get().getDate()) ||
                    lastExpense.get().getDate().isEqual(lastIncome.get().getDate())) {
                    // expense is newer
                    Expense e = lastExpense.get();
                    return String.format("💸 Your latest transaction is an **Expense**:\n- **Category**: %s\n- **Description**: %s\n- **Amount**: ₹%s\n- **Date**: %s",
                            e.getCategory(), e.getDescription(), e.getAmount().setScale(2, BigDecimal.ROUND_HALF_UP), e.getDate().format(DATE_FORMATTER));
                } else {
                    // income is newer
                    Income i = lastIncome.get();
                    return String.format("💰 Your latest transaction is an **Income**:\n- **Source**: %s\n- **Amount**: ₹%s\n- **Date**: %s",
                            i.getSource(), i.getAmount().setScale(2, BigDecimal.ROUND_HALF_UP), i.getDate().format(DATE_FORMATTER));
                }
            } else if (lastExpense.isPresent()) {
                Expense e = lastExpense.get();
                return String.format("💸 Your latest transaction is an **Expense**:\n- **Category**: %s\n- **Description**: %s\n- **Amount**: ₹%s\n- **Date**: %s",
                        e.getCategory(), e.getDescription(), e.getAmount().setScale(2, BigDecimal.ROUND_HALF_UP), e.getDate().format(DATE_FORMATTER));
            } else {
                Income i = lastIncome.get();
                return String.format("💰 Your latest transaction is an **Income**:\n- **Source**: %s\n- **Amount**: ₹%s\n- **Date**: %s",
                        i.getSource(), i.getAmount().setScale(2, BigDecimal.ROUND_HALF_UP), i.getDate().format(DATE_FORMATTER));
            }
        }

        // 5. Default helpful guidance
        return "🤖 I'm your Finance Assistant! Here are some things you can ask me:\n" +
                "- *\"What is my current balance?\"*\n" +
                "- *\"What is my total expense today?\"*\n" +
                "- *\"Show weekly expense\"*\n" +
                "- *\"Last transaction\"*\n\n" +
                "You can also manage your budget using the tabs on the left!";
    }
}
