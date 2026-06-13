const registroForm = document.getElementById("registroForm");
const loginForm = document.getElementById("loginForm");

if (registroForm) {
  registroForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const nombre = document.getElementById("regNombre").value.trim();
    const correo = document.getElementById("regCorreo").value.trim();
    const password = document.getElementById("regPassword").value.trim();
    const tipo = document.getElementById("regTipo").value;

    try {
      const respuesta = await fetch("http://localhost:5000/api/usuarios", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          nombre,
          correo,
          tipoUsuario: tipo,
          password
        })
      });

      const data = await respuesta.json();

      if (!respuesta.ok) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: data.mensaje
        });
        return;
      }

      Swal.fire({
        icon: "success",
        title: "Cuenta creada",
        text: "Registro exitoso"
      }).then(() => {
        window.location.href = "login.html";
      });

    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: "error",
        title: "Error del servidor"
      });
    }
  });
}

if (loginForm) {
  loginForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const correo = document.getElementById("loginCorreo").value.trim();
    const password = document.getElementById("loginPassword").value.trim();

    try {
      const respuesta = await fetch("http://localhost:5000/api/usuarios/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ correo, password })
      });

      const data = await respuesta.json();

      if (!respuesta.ok) {
        Swal.fire({
          icon: "error",
          title: "Error de acceso",
          text: data.mensaje
        });
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("usuario", JSON.stringify(data.usuario));

      Swal.fire({
        icon: "success",
        title: "Bienvenido 👋",
        text: `Hola ${data.usuario.nombre}`
      }).then(() => {
        if (data.usuario.tipoUsuario === "admin") {
          window.location.href = "admin.html";
        } else {
          window.location.href = "home.html";
        }
      });

    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: "error",
        title: "Error del servidor"
      });
    }
  });
}

// Recuperación de contraseña
const forgotLink = document.getElementById("forgotPassword");
const forgotContainer = document.getElementById("forgotContainer");
const forgotSubmit = document.getElementById("forgotSubmit");

if (forgotLink) {
  forgotLink.addEventListener("click", function (e) {
    e.preventDefault();
    if (forgotContainer.style.display === "none" || forgotContainer.style.display === "") {
      forgotContainer.style.display = "block";
    } else {
      forgotContainer.style.display = "none";
    }
  });

  if (forgotSubmit) {
    forgotSubmit.addEventListener("click", function () {
      const email = document.getElementById("forgotEmail").value.trim();
      if (!email) {
        Swal.fire({
          icon: "warning",
          title: "Correo requerido",
          text: "Debes ingresar un correo",
          confirmButtonColor: "#4e7a8c"
        });
        return;
      }
      Swal.fire({
        icon: "success",
        title: "Correo enviado",
        text: "Se enviaron indicaciones para restablecer tu contraseña",
        confirmButtonColor: "#4e7a8c"
      });
      document.getElementById("forgotEmail").value = "";
      forgotContainer.style.display = "none";
    });
  }
}