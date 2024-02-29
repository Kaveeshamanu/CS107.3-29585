using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography.X509Certificates;
using System.Text;
using System.Threading.Tasks;

namespace Lab04_2802_
{
    //LabSheet_3(Q1)

    /* 
  * public class Course
     {
         private string courseName;
         private string InstructorName;
         private double grade;

         public string getCourseName() 
         {
             return courseName; 
         }
         public string getInstructorName()
         {
             return InstructorName;
         }

         public void setCourseName(string courseN)
         {
             courseName = courseN;
         }

         public void setInstructorName(string name)
         {
           if (name != "") { }
           InstructorName = name;

         }



         private string CalculateLetterGrade(double grade)
         {
             if(grade > 75)
             {
                 return "A";
             }
             else if(grade > 65)
             {
                 return "B";
             }
             else if (grade > 55)
             {
                 return "C";
             }
             else if(grade > 45)
             {
                 return "D";
             }
             else if(grade > 35)
             {
                 return "E";

             }
             else
             {
                 return "F";
             }
         }

         public void PrintCourseInfo()
         {
             Console.WriteLine("COurse Name is :" +courseName);
             Console.WriteLine("Instructor is :" + InstructorName);
             Console.WriteLine("Grade: " + CalculateLetterGrade(grade));
         }
      }

     internal class Program
     {
         static void Main(string[] args)
         {

             Course course = new Course();
             course.setCourseName("C#");
             course.setInstructorName("Srimal");
             course.setGarde(67);

             course.PrintCourseInfo();

         }
     }
 }
    */


    //LabSheet_3(Q2)
    /*  public class Employee
      {
          private int employeeID;
          private string FullName;
          private double Salary;

          //constructor
          public Employee(int employeeID, string FullName, double Salary)
          {
              this.employeeID = employeeID;
              this.FullName = FullName;
              this.Salary = Salary;




       }

          public void DisplayEmployeeInfo()
          {
              Console.WriteLine("Employee ID :" + employeeID);
              Console.WriteLine("Employee Name :" + FullName);
              Console.WriteLine("Salary :" + Salary);
          }


          public int getEmployeeID()
          {
              return this.employeeID;
          }


      }

      internal class program
      {
          static void Main(string[] args)
          {
              Employee em = new Employee(101,"Saman",50000);
              em.DisplayEmployeeInfo();
              Console.WriteLine("Reading the employee id :" + em.getEmployeeID());
              Console.ReadLine();

              //modifying the salary
              //em.Salary = 60000;
          }

      }

  }
*/

    //LabSheet_3(Q3)

    /*  public class Product
      {
          public int productID;
          public string productName;
          public double price;
          public int quantityInStock;

          //constructor
          public Product(int productID, string productName, double price, int quantityInStock)
          {
              this.productID = productID;
              this.productName = productName;
              this.price = price;
              this.quantityInStock = quantityInStock;
          }
          public string getProductName() 
          { 
              return productName; 
          }

          public double getPrice()
          {
              return price;
          }

          public int getQuantityInStock()
          {
              return quantityInStock;
          }

          public void AddPoint()
          {

          }

      }



      internal class program
      {
          static void Main(string[] args)
          {
              Product lap = new Product(101, "Laptop", 800, 10);
              Console.WriteLine("Product Name: " + lap.getProductName());
              Console.WriteLine("Quantity: " + lap.getProductName());


          }
      }
  }
  */

//LabSheet_3(Q4)
 
    public class Shape
    {
        public string ShapeType;
        public double Area;

        public Shape(String st)
        {
            ShapeType = st;
        }

        public void CalculateArea(double val1,  double val2)
        {
            Area = val1 * val2;
        }

        public void DisplayShapeInfo()
        {
            Console.WriteLine("Shape is :" + ShapeType);
            Console.WriteLine("Area is: "+Area);
        }
    }

    public class Rectangle : Shape
    {

        public double length;
        public double width;
    }
    public class Circle : Shape
    {
        public double radius;

    }



    internal class program
    {
        static void Main(string[] args)
        {

        }
    }
}

