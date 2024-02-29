 using System;
 using System.Collections.Generic;
 using System.Linq;
 using System.Runtime.Remoting.Services;
using System.Security;
using System.Text;
 using System.Threading.Tasks;

 namespace Lab_Session1_2401_
 {
      internal class Program
      {
            static void Main(string[] args)
            {
            /* 01.write a console application program to calculate the area of a rectangle.
              * Promt the user to enter the lenth and width. 
              * Display the calculate area. (use a separate funtion calculate the area)*/


            /* Console.WriteLine("Enter Length of rectangle");
             int mylength = Convert.ToInt32(Console.ReadLine());

             Console.WriteLine("Enter the width of rectangle");
             int mywidth = Convert.ToInt32(Console.ReadLine());

             CalArea(mywidth, mylength); //call the  funtion

            }
            static void CalArea(int width , int length) 
            {
             int area;

             area = length * width;
             Console.WriteLine ("The Area is : "+area);
             Console.ReadLine(); */


            /* 02. Write a console application program to check if the given 10 numbers inputs are even or
             *  odd. Prompt the user to enter the numbers and display whether its even or odd*/


            /*for (int i = 0; i <= 10; i++)
            {
                Console.WriteLine("Enter the Number :");
                int number = Convert.ToInt32( Console.ReadLine() ); //convert string to integer

                if (number % 2 == 0)
                {
                    Console.WriteLine("It is an even number");
                }

                else
                {
                    Console.WriteLine("It is an Odd number");
                }



            }

            Console.ReadLine();*/


            /* 03.write a console application program to calculate the sum of all numbers from 1 to a
             * given positive intreger prompt the user to enter a positive integer and display the sum.
             * if user inputs a negtaive value it should display ERROR */

            /*Console.WriteLine("Enter number ");
            int num = Convert.ToInt32(Console.ReadLine());

            int sum = 0;


            for (int i = 1; i <= num; i++)
            {

                if (num >= 0)
                {
                    sum += i;


                }
                else
                {
                    Console.WriteLine("ERROR");
                }
            }
            Console.WriteLine("The Sum :" + sum);
            Console.ReadLine(); */

            // 04. Write a console application program to print the N terms of the Fibonacci series

            /* int number;

            Console.WriteLine("Enter the number of terms");
            number = int.Parse(Console.ReadLine());

            Console.WriteLine("First " + number + " terms of the fibonacci series:  ");
            for (int i = 0; i < number; i++)
            {
                int result = Fibonacci(i);
                Console.WriteLine(result);


            }

            Console.ReadLine();

            }
            static int Fibonacci(int n)
            {
            if (n <= 1) // this is the base case, the fibonacci of the 0 is o and 1 is 1
            {
                return n; // se here i have got this n
            }
            else
            {
                return Fibonacci(n - 1) + Fibonacci(n - 2); //the function recursively calls itself with n-1 and n-2 */

            /* 05.Write a Console Application program to display the multiplication table of a given number. 
             * Prompt the user to enter a number and display its multiplication table. (Use loops).*/

            /* int j;

             Console.WriteLine("Enter the Number");
             int n = Convert.ToInt32(Console.ReadLine());

             for(j = 1; j <= 10; j++) //loop to calculate and display the multiplication table of enterd number up to 10
             {
                 Console.WriteLine("{0} * {1} = {2} \n",n ,j, n * j);
             } */

            /* 06.Create a C# console application that prompts the user to input a student's name and their exam marks. Based on the provided marks, determine, and display the corresponding grade for the student. The grading scale is as follows:
            •	If the marks are between 75 and 100 (inclusive), assign Grade A.
            •	For marks between 60 and 74 (inclusive), assign Grade B.
            •	For marks between 50 and 59 (inclusive), assign Grade C.
            •	For marks between 40 and 49 (inclusive), assign Grade D.
            •	If the marks are below 40, the student has failed.
            •	Display the student's name along with their assigned grade at the end of the program.
            •	Validate the user input so that when the user inputs a value higher than 100 and less than 0 it displays an error message */

            /* 
           * Console.WriteLine("Enter student's name:");
            string studentName = Console.ReadLine();

            Console.WriteLine("Enter exam marks:");
            if (int.TryParse(Console.ReadLine(), out int examMarks))
            {
                if (examMarks >= 0 && examMarks <= 100)
                {
                    char grade = GetGrade(examMarks);
                    Console.WriteLine($"{studentName}'s grade is: {grade}");
                }
                else
                {
                    Console.WriteLine("Error: Marks should be between 0 and 100.");
                }
            }
            else
            {
                Console.WriteLine("Error: Invalid input for exam marks. Please enter a valid numeric value.");
            }
        }

        static char GetGrade(int marks)
        {
            if (marks >= 75 && marks <= 100)
            {
                return 'A';
            }
            else if (marks >= 60 && marks <= 74)
            {
                return 'B';
            }
            else if (marks >= 50 && marks <= 59)
            {
                return 'C';
            }
            else if (marks >= 40 && marks <= 49)
            {
                return 'D';
            }
            else
            {
                return 'F';
            } */

            /* 07.Write a console application program to simulate a basic ATM machine.
             * Allow the user to check balance ,deposit money and withdraw money.
             * Display appropriate masseges based on user action(create seperate functions for individual operations) */

            ATM atm = new ATM();

            while (true)
            {
                Console.WriteLine("1. Check balance");
                Console.WriteLine("2. Deposit");
                Console.WriteLine("3. Withdraw");
                Console.WriteLine("4. Quit");
                Console.Write("Enter choice: ");

                int choice = int.Parse(Console.ReadLine());

                switch (choice)
                {
                    case 1:
                        atm.CheckBalance();
                        break;
                    case 2:
                        atm.Deposit();
                        break;
                    case 3:
                        atm.Withdraw();
                        break;
                    case 4:
                        Console.WriteLine("Thank you for using our ATM!");
                        return;
                    default:
                        Console.WriteLine("Invalid choice.");
                        break;
                }
            }
        }
    }

    class ATM
    {
        private double balance = 0;

        public void CheckBalance()
        {
            Console.WriteLine($"Your current balance is: ${balance}");
        }

        public void Deposit()
        {
            Console.Write("Enter amount to be deposited: $");
            double amount = double.Parse(Console.ReadLine());
            balance += amount;
            Console.WriteLine($"Amount deposited: ${amount}");
        }

        public void Withdraw()
        {
            Console.Write("Enter amount to be withdrawn: $");
            double amount = double.Parse(Console.ReadLine());

            if (balance >= amount)
            {
                balance -= amount;
                Console.WriteLine($"Amount withdrawn: ${amount}");
            }
            else
            {
                Console.WriteLine("Insufficient balance.");
            }


        }
    }

 }
